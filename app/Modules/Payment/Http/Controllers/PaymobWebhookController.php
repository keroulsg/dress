<?php

declare(strict_types=1);

namespace App\Modules\Payment\Http\Controllers;

use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Payment\Application\Services\PaymentService;
use App\Modules\Payment\Domain\Enums\TransactionStatus;
use App\Modules\Payment\Domain\Enums\TransactionType;
use App\Modules\Payment\Domain\Events\PaymentCaptured;
use App\Modules\Payment\Infrastructure\Gateways\PaymobPaymentGateway;
use App\Modules\Payment\Infrastructure\Repositories\PaymentRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

class PaymobWebhookController extends Controller
{
    public function __construct(
        private readonly PaymobPaymentGateway $gateway,
        private readonly BookingOrchestratorContract $bookings,
        private readonly PaymentRepository $payments,
        private readonly PaymentService $paymentService,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $payload = $request->all();
        $data = $payload['obj'] ?? $payload;

        // 1. Verify HMAC Signature
        $receivedHmac = (string) $request->query('hmac', (string) ($payload['hmac'] ?? ''));

        if ($receivedHmac !== '' && ! $this->gateway->verifyTransactionHmac($data, $receivedHmac)) {
            Log::warning('Paymob Webhook HMAC Verification Failed', ['payload' => $payload]);

            return response()->json(['error' => 'Invalid HMAC signature'], 400);
        }

        // 2. Extract transaction identifiers
        $isSuccess = filter_var(data_get($data, 'success', false), FILTER_VALIDATE_BOOLEAN);
        $isPending = filter_var(data_get($data, 'pending', false), FILTER_VALIDATE_BOOLEAN);
        $isRefunded = filter_var(data_get($data, 'is_refunded', false), FILTER_VALIDATE_BOOLEAN);
        $isVoided = filter_var(data_get($data, 'is_voided', false), FILTER_VALIDATE_BOOLEAN);

        $merchantOrderId = (string) (data_get($data, 'order.merchant_order_id')
            ?? data_get($data, 'merchant_order_id')
            ?? data_get($data, 'order.id'));

        $transactionId = (string) data_get($data, 'id');
        $amountCents = (int) data_get($data, 'amount_cents', 0);
        $currency = (string) data_get($data, 'currency', 'EGP');

        if ($merchantOrderId === '') {
            return response()->json(['error' => 'Missing merchant_order_id'], 422);
        }

        // 3. Pessimistic Lock & Atomic Booking Transition
        return DB::transaction(function () use (
            $merchantOrderId,
            $transactionId,
            $amountCents,
            $currency,
            $isSuccess,
            $isPending,
            $isRefunded,
            $isVoided,
            $data
        ): JsonResponse {
            $booking = Booking::query()
                ->where('id', is_numeric($merchantOrderId) ? (int) $merchantOrderId : 0)
                ->orWhere('booking_reference', $merchantOrderId)
                ->lockForUpdate()
                ->first();

            if (! $booking) {
                Log::warning('Paymob Webhook: Booking not found', ['merchant_order_id' => $merchantOrderId]);

                return response()->json(['error' => 'Booking not found'], 404);
            }

            // If payment is successful, not pending, and not voided/refunded
            if ($isSuccess && ! $isPending && ! $isRefunded && ! $isVoided) {
                if ($booking->status === BookingStatus::PendingPayment) {
                    $this->bookings->transitionStatus(
                        $booking->id,
                        BookingStatus::Confirmed,
                        [
                            'actor_id' => null,
                            'reason' => 'Paymob online payment verified via webhook (Tx: '.$transactionId.').',
                        ]
                    );

                    $amountDecimal = number_format($amountCents / 100, 2, '.', '');
                    $dbTxId = $this->payments->storeTransaction([
                        'booking_id' => $booking->id,
                        'user_id' => $booking->renter_id,
                        'atelier_id' => $booking->atelier_id,
                        'type' => TransactionType::RentalPayment->value,
                        'payment_method' => (string) (data_get($data, 'source_data.type') ?? 'paymob_card'),
                        'status' => TransactionStatus::Captured->value,
                        'amount' => $amountDecimal,
                        'currency' => $currency,
                        'gateway_reference' => 'PAYMOB-'.$transactionId,
                        'idempotency_key' => 'paymob-webhook-'.$transactionId,
                        'metadata_json' => $data,
                    ]);

                    Event::dispatch(new PaymentCaptured($dbTxId, $booking->id));
                }

                return response()->json([
                    'status' => 'success',
                    'booking_id' => $booking->id,
                    'booking_status' => 'confirmed',
                    'transaction_id' => $transactionId,
                ]);
            }

            return response()->json([
                'status' => 'ignored',
                'booking_id' => $booking->id,
                'booking_status' => $booking->status->value,
            ]);
        });
    }
}
