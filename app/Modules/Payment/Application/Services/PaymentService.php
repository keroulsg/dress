<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\Services;

use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Payment\Application\DTOs\PaymentSessionDTO;
use App\Modules\Payment\Application\DTOs\PaymentSessionResultDTO;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Contracts\PaymentGatewayContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Payment\Domain\Enums\TransactionStatus;
use App\Modules\Payment\Domain\Enums\TransactionType;
use App\Modules\Payment\Domain\Events\DepositSettled;
use App\Modules\Payment\Domain\Events\PaymentCaptured;
use App\Modules\Payment\Domain\Events\PaymentRefunded;
use App\Modules\Payment\Domain\Exceptions\PaymentFailedException;
use App\Modules\Payment\Domain\Exceptions\PaymentStateException;
use App\Modules\Payment\Infrastructure\Repositories\PaymentRepository;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

/**
 * Payment orchestrator. Every financial mutation runs inside a transaction and
 * is protected by a unique idempotency key; replays never create duplicate
 * financial entries.
 */
class PaymentService implements PaymentContract
{
    public function __construct(
        private readonly PaymentRepository $payments,
        private readonly PaymentGatewayContract $gateway,
        private readonly BookingOrchestratorContract $bookings,
    ) {}

    public function initiateBookingPayment(int $bookingId, string $paymentMethod, string $returnUrl, string $idempotencyKey): PaymentSessionResultDTO
    {
        return DB::transaction(function () use ($bookingId, $paymentMethod, $returnUrl, $idempotencyKey): PaymentSessionResultDTO {
            $booking = $this->lockBooking($bookingId);

            if ($booking->status !== BookingStatus::PendingPayment) {
                throw PaymentStateException::bookingNotPayable($bookingId, $booking->status->value);
            }

            $replay = $this->payments->findIdempotencyRecord($idempotencyKey);

            if ($replay !== null) {
                $transaction = $this->payments->findTransaction((int) $replay['transaction_id']);

                return $this->replaySession($transaction);
            }

            $chargeable = $this->chargeableFor($booking);
            $deposit = $this->depositFor($booking);

            $transactionId = $this->payments->storeTransaction([
                'booking_id' => $bookingId,
                'user_id' => $booking->renter_id,
                'atelier_id' => $booking->atelier_id,
                'type' => TransactionType::RentalPayment->value,
                'payment_method' => $paymentMethod,
                'status' => TransactionStatus::Initiated->value,
                'amount' => $chargeable->amount(),
                'currency' => $booking->currency,
                'idempotency_key' => $idempotencyKey,
                'metadata_json' => ['stage' => 'initiated'],
            ]);

            $this->payments->storeIdempotencyKey($idempotencyKey, 'rental_payment', $transactionId);

            $session = $this->gateway->createPaymentSession(new PaymentSessionDTO(
                bookingId: $bookingId,
                userId: $booking->renter_id,
                atelierId: $booking->atelier_id,
                amount: $chargeable,
                paymentMethod: $paymentMethod,
                returnUrl: $returnUrl,
                idempotencyKey: $idempotencyKey,
            ));

            $status = $session->status === 'approved' ? TransactionStatus::Authorized->value : TransactionStatus::Initiated->value;
            $this->payments->updateTransactionStatus($transactionId, $status, $session->gatewayReference);

            // Distinct pre-authorization (card freeze) for the security deposit.
            if (! $deposit->isZero()) {
                $this->authorizeDepositHold($bookingId, $booking, $deposit, $paymentMethod, $idempotencyKey.'-deposit');
            }

            return new PaymentSessionResultDTO(
                transactionId: $transactionId,
                status: $session->status,
                redirectUrl: $session->redirectUrl,
                gatewayReference: $session->gatewayReference,
                message: $session->message,
            );
        });
    }

    public function handlePaymentSuccess(string $gatewayReference, string $idempotencyKey, array $payload = []): Transaction
    {
        return DB::transaction(function () use ($gatewayReference, $idempotencyKey): Transaction {
            $transaction = $this->payments->findByGatewayReference($gatewayReference);

            if ($transaction === null) {
                throw PaymentFailedException::gatewayError('Unknown gateway reference.');
            }

            $transactionId = (int) $transaction['id'];

            if ($transaction['status'] === TransactionStatus::Captured->value) {
                return $this->payments->findEntity($transactionId)
                    ?? throw PaymentFailedException::gatewayError('Captured transaction not found.');
            }

            $captureReplay = $this->payments->findIdempotencyRecord($idempotencyKey);

            if ($captureReplay !== null && (int) $captureReplay['transaction_id'] === $transactionId) {
                return $this->payments->findEntity($transactionId)
                    ?? throw PaymentFailedException::gatewayError('Captured transaction not found.');
            }

            $amount = Money::fromDecimal($transaction['amount'], (string) $transaction['currency']);
            $this->gateway->capturePayment($gatewayReference, $amount);

            $this->payments->updateTransactionStatus($transactionId, TransactionStatus::Captured->value);
            $this->payments->storeIdempotencyKey($idempotencyKey, 'capture', $transactionId);

            $this->bookings->transitionStatus(
                (int) $transaction['booking_id'],
                BookingStatus::Confirmed,
                ['actor_id' => null],
            );

            Event::dispatch(new PaymentCaptured($transactionId, (int) $transaction['booking_id']));

            return $this->payments->findEntity($transactionId)
                ?? throw PaymentFailedException::gatewayError('Captured transaction not found.');
        });
    }

    public function handlePaymentFailure(string $gatewayReference, string $errorMessage): void
    {
        DB::transaction(function () use ($gatewayReference): void {
            $transaction = $this->payments->findByGatewayReference($gatewayReference);

            if ($transaction === null) {
                return;
            }

            $this->payments->updateTransactionStatus((int) $transaction['id'], TransactionStatus::Failed->value);
        });
    }

    public function processDepositSettlement(int $bookingId, Money $depositHeld, Money $deductionAmount, Money $refundAmount, string $idempotencyKey): void
    {
        DB::transaction(function () use ($bookingId, $depositHeld, $deductionAmount, $refundAmount, $idempotencyKey): void {
            if ($this->payments->findIdempotencyRecord($idempotencyKey) !== null) {
                return;
            }

            $depositTransaction = $this->payments->findLatestDepositAuthorization($bookingId);

            if ($depositTransaction === null) {
                return;
            }

            $authorizationRef = (string) ($depositTransaction['gateway_reference'] ?? '');
            $user = $this->payments->findEntity((int) $depositTransaction['id'])?->user_id;

            if (! $deductionAmount->isZero()) {
                $this->gateway->captureDeposit($authorizationRef, $deductionAmount);

                $this->payments->storeTransaction([
                    'booking_id' => $bookingId,
                    'user_id' => $user,
                    'type' => TransactionType::DepositPenalty->value,
                    'payment_method' => $depositTransaction['payment_method'] ?? null,
                    'status' => TransactionStatus::Captured->value,
                    'amount' => $deductionAmount->amount(),
                    'currency' => $deductionAmount->currency(),
                    'idempotency_key' => $idempotencyKey.'-penalty',
                ]);
            }

            if (! $refundAmount->isZero()) {
                $this->gateway->releaseDeposit($authorizationRef);

                $this->payments->storeTransaction([
                    'booking_id' => $bookingId,
                    'user_id' => $user,
                    'type' => TransactionType::DepositRelease->value,
                    'payment_method' => $depositTransaction['payment_method'] ?? null,
                    'status' => TransactionStatus::Voided->value,
                    'amount' => $refundAmount->amount(),
                    'currency' => $refundAmount->currency(),
                    'idempotency_key' => $idempotencyKey.'-release',
                ]);

                $this->payments->updateTransactionStatus((int) $depositTransaction['id'], TransactionStatus::Voided->value);
            }

            $this->payments->storeIdempotencyKey($idempotencyKey, 'deposit_settlement', (int) $depositTransaction['id']);

            Event::dispatch(new DepositSettled($bookingId, (int) $depositTransaction['id'], $depositHeld, $deductionAmount, $refundAmount));
        });
    }

    public function processCustomerRefund(int $bookingId, Money $amount, string $reason, string $idempotencyKey): Transaction
    {
        return DB::transaction(function () use ($bookingId, $amount, $reason, $idempotencyKey): Transaction {
            $replay = $this->payments->findIdempotencyRecord($idempotencyKey);

            if ($replay !== null) {
                return $this->payments->findEntity((int) $replay['transaction_id'])
                    ?? throw PaymentFailedException::gatewayError('Refund transaction not found.');
            }

            $rentalTransaction = $this->payments->findCapturedRentalForBooking($bookingId);

            if ($rentalTransaction === null) {
                throw PaymentFailedException::gatewayError('No captured rental payment to refund.');
            }

            $this->gateway->refundPayment(
                (string) ($rentalTransaction['gateway_reference'] ?? ''),
                $amount,
                $reason,
            );

            $transactionId = $this->payments->storeTransaction([
                'booking_id' => $bookingId,
                'user_id' => $rentalTransaction['user_id'] ?? null,
                'atelier_id' => $rentalTransaction['atelier_id'] ?? null,
                'type' => TransactionType::CustomerRefund->value,
                'payment_method' => $rentalTransaction['payment_method'] ?? null,
                'status' => TransactionStatus::Refunded->value,
                'amount' => $amount->amount(),
                'currency' => $amount->currency(),
                'idempotency_key' => $idempotencyKey,
            ]);

            $this->payments->storeIdempotencyKey($idempotencyKey, 'customer_refund', $transactionId);

            Event::dispatch(new PaymentRefunded($transactionId, $bookingId));

            return $this->payments->findEntity($transactionId)
                ?? throw PaymentFailedException::gatewayError('Refund transaction not found.');
        });
    }

    private function lockBooking(int $bookingId): Booking
    {
        $booking = Booking::query()->whereKey($bookingId)->lockForUpdate()->first();

        if ($booking === null) {
            throw PaymentFailedException::gatewayError(sprintf('Booking #%d not found.', $bookingId));
        }

        return $booking;
    }

    private function chargeableFor(Booking $booking): Money
    {
        $grandTotal = Money::fromDecimal($booking->grand_total, $booking->currency);
        $deposit = Money::fromDecimal($booking->security_deposit_amount, $booking->currency);

        return $grandTotal->subtract($deposit);
    }

    private function depositFor(Booking $booking): Money
    {
        return Money::fromDecimal($booking->security_deposit_amount, $booking->currency);
    }

    private function authorizeDepositHold(int $bookingId, Booking $booking, Money $amount, string $paymentMethod, string $idempotencyKey): void
    {
        if ($this->payments->findIdempotencyRecord($idempotencyKey) !== null) {
            return;
        }

        $result = $this->gateway->authorizeDeposit($bookingId, $amount, $paymentMethod);

        $transactionId = $this->payments->storeTransaction([
            'booking_id' => $bookingId,
            'user_id' => $booking->renter_id,
            'atelier_id' => $booking->atelier_id,
            'type' => TransactionType::DepositAuthorization->value,
            'payment_method' => $paymentMethod,
            'status' => TransactionStatus::Authorized->value,
            'amount' => $amount->amount(),
            'currency' => $amount->currency(),
            'gateway_reference' => $result->gatewayReference,
            'idempotency_key' => $idempotencyKey,
            'metadata_json' => ['stage' => 'hold'],
        ]);

        $this->payments->storeIdempotencyKey($idempotencyKey, 'deposit_authorization', $transactionId);
    }

    private function replaySession(?array $transaction): PaymentSessionResultDTO
    {
        return new PaymentSessionResultDTO(
            transactionId: (int) ($transaction['id'] ?? 0),
            status: $transaction['status'] ?? TransactionStatus::Initiated->value,
            gatewayReference: $transaction['gateway_reference'] ?? null,
            isReplay: true,
        );
    }
}
