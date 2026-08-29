<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Listeners;

use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Payment\Domain\Events\PaymentRefunded;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Posts the customer-refund reversal journal (escrow credit, atelier payable
 * and commission reversed) when a rental refund is processed.
 */
class PostCustomerRefundLedger
{
    public function __construct(private readonly LedgerContract $ledger) {}

    public function handle(PaymentRefunded $event): void
    {
        $transaction = Transaction::query()->with('booking.atelier')->find($event->transactionId);

        if ($transaction === null || $transaction->booking === null) {
            return;
        }

        $refundAmount = Money::fromDecimal($transaction->amount, $transaction->currency);
        $rate = $transaction->booking->atelier?->commission_rate !== null
            ? (float) $transaction->booking->atelier->commission_rate / 100
            : 0.0;

        $reversalCommission = $refundAmount->multiply((string) $rate);

        $this->ledger->recordCustomerRefund($transaction, $refundAmount, $reversalCommission);
    }
}
