<?php

declare(strict_types=1);

namespace App\Modules\Payment\Http\Controllers\Storefront;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Payment\Application\Services\PaymentService;
use App\Modules\Payment\Domain\Exceptions\PaymentFailedException;
use App\Modules\Payment\Domain\Exceptions\PaymentStateException;
use App\Modules\Payment\Http\Requests\InitiatePaymentRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutPaymentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly PaymentService $payments) {}

    public function showPay(Request $request, Booking $booking): Response|RedirectResponse
    {
        $this->authorize('view', $booking);

        if ($booking->status !== BookingStatus::PendingPayment) {
            return redirect()->route('customer.bookings.show', $booking)
                ->with('status', 'هذا الحجز لا يحتاج إلى سداد عربون حالياً.');
        }

        $booking->load(['items.dress.primaryImage', 'atelier']);

        $totalBookingValue = bcadd((string) $booking->rental_rate_total, (string) $booking->cleaning_fee_total, 2);
        $upfrontFee = bcdiv(bcmul($totalBookingValue, '10', 4), '100', 2);
        $remainingRentalBalance = bcsub($totalBookingValue, $upfrontFee, 2);
        $offlineSettlementTotal = bcadd($remainingRentalBalance, (string) $booking->security_deposit_amount, 2);

        $dress = $booking->items->first()?->dress;

        return Inertia::render('Checkout/Pay', [
            'booking' => [
                'id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'status' => $booking->status->value,
                'start_date' => $booking->start_date?->toDateString(),
                'end_date' => $booking->end_date?->toDateString(),
                'currency' => $booking->currency,
                'rental_rate_total' => $booking->rental_rate_total,
                'cleaning_fee_total' => $booking->cleaning_fee_total,
                'security_deposit_amount' => $booking->security_deposit_amount,
                'grand_total' => $booking->grand_total,
                'total_booking_value' => $totalBookingValue,
                'upfront_reservation_fee' => $upfrontFee,
                'offline_settlement_balance' => $offlineSettlementTotal,
                'dress' => $dress ? [
                    'id' => $dress->id,
                    'title' => $dress->title,
                    'image_url' => $dress->primaryImage?->image_path,
                ] : null,
                'atelier' => $booking->atelier ? [
                    'id' => $booking->atelier->id,
                    'business_name' => $booking->atelier->business_name,
                    'city' => $booking->atelier->city,
                ] : null,
            ],
        ]);
    }

    public function pay(InitiatePaymentRequest $request, Booking $booking): RedirectResponse
    {
        $this->authorize('view', $booking);

        try {
            $session = $this->payments->initiateBookingPayment(
                $booking->id,
                (string) $request->string('payment_method'),
                route('checkout.payment-callback', $booking),
                (string) $request->string('idempotency_token'),
            );
        } catch (PaymentStateException $exception) {
            return back()->withErrors(['payment' => $exception->getMessage()]);
        } catch (PaymentFailedException $exception) {
            return back()->withErrors(['payment' => $exception->getMessage()]);
        }

        if ($session->status === 'declined') {
            return back()->withErrors(['payment' => $session->message ?? 'Payment was declined.']);
        }

        if ($session->status === 'requires_action' || $session->status === 'redirect') {
            $url = $session->redirectUrl ?? route('checkout.payment-callback', $booking);

            return redirect()->away($url);
        }

        // Immediate approval — finalize directly.
        $this->payments->handlePaymentSuccess(
            (string) $session->gatewayReference,
            'session-'.$session->transactionId,
        );

        return redirect()->route('customer.bookings.show', $booking)->with('payment', 'success');
    }

    public function paymentCallback(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('view', $booking);

        $gatewayReference = (string) $request->string('gateway_reference');
        $idempotencyKey = (string) $request->string('idempotency_key');
        $status = (string) $request->string('status', 'success');

        try {
            if ($status === 'success' && $gatewayReference !== '') {
                $this->payments->handlePaymentSuccess($gatewayReference, $idempotencyKey !== '' ? $idempotencyKey : 'callback-'.$booking->id);
            } else {
                $this->payments->handlePaymentFailure($gatewayReference, 'Payment was not completed.');
            }
        } catch (PaymentFailedException) {
            return redirect()->route('customer.bookings.show', $booking)->with('payment', 'failed');
        }

        return redirect()->route('customer.bookings.show', $booking)->with('payment', $status);
    }

    public function paymentCancel(Booking $booking): RedirectResponse
    {
        return redirect()->route('checkout.show', $booking)->with('error', 'Payment was cancelled.');
    }
}
