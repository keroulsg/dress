<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Listeners;

use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Payment\Domain\Events\DepositSettled;

/**
 * Posts the deposit-settlement journal (liability 2010 cleared, escrow and
 * atelier damage compensation credited) when a deposit is settled.
 */
class PostDepositSettlementLedger
{
    public function __construct(private readonly LedgerContract $ledger) {}

    public function handle(DepositSettled $event): void
    {
        $transaction = Transaction::query()->find($event->transactionId);

        if ($transaction === null) {
            return;
        }

        $this->ledger->recordDepositSettlement(
            $transaction,
            $event->depositHeld,
            $event->deductionAmount,
            $event->refundAmount,
        );
    }
}
