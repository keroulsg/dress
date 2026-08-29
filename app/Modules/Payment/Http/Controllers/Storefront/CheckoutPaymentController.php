<?php

declare(strict_types=1);

namespace App\Modules\Payment\Http\Controllers\Storefront;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Payment\Application\Services\PaymentService;
use App\Modules\Payment\Domain\Exceptions\PaymentFailedException;
use App\Modules\Payment\Domain\Exceptions\PaymentStateException;
use App\Modules\Payment\Http\Requests\InitiatePaymentRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CheckoutPaymentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly PaymentService $payments) {}

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
