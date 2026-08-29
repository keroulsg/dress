<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Listeners;

use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Payment\Domain\Events\PaymentCaptured;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Posts the standard booking-capture journal when a rental payment is captured.
 */
class PostBookingCaptureLedger
{
    public function __construct(private readonly LedgerContract $ledger) {}

    public function handle(PaymentCaptured $event): void
    {
        $transaction = Transaction::query()->with('booking.atelier')->find($event->transactionId);

        if ($transaction === null || $transaction->booking === null) {
            return;
        }

        $booking = $transaction->booking;
        $currency = $booking->currency;

        $subtotal = Money::fromDecimal($booking->rental_rate_total, $currency);
        $cleaningFee = Money::fromDecimal($booking->cleaning_fee_total, $currency);
        $deposit = Money::fromDecimal($booking->security_deposit_amount, $currency);

        $rate = $booking->atelier?->commission_rate !== null
            ? (float) $booking->atelier->commission_rate / 100
            : 0.0;

        $commission = $subtotal->multiply((string) $rate);

        $this->ledger->recordBookingCapture($transaction, $subtotal, $cleaningFee, $deposit, $commission);
    }
}
