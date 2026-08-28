<?php

declare(strict_types=1);

namespace App\Modules\Finance\Application\Services;

use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Finance\Domain\Exceptions\LedgerAccountNotFoundException;
use App\Modules\Finance\Domain\Exceptions\UnbalancedLedgerException;
use App\Modules\Finance\Infrastructure\Repositories\LedgerRepository;

/**
 * Double-entry ledger authority. Postings are rejected unless total debits
 * equal total credits, and posting is idempotent per transaction.
 */
class DoubleEntryLedgerService implements LedgerContract
{
    private const SCALE = 4;

    public function __construct(
        private readonly LedgerRepository $ledger,
    ) {}

    public function recordTransaction(int $transactionId, array $ledgerEntries): void
    {
        $debits = '0';
        $credits = '0';

        foreach ($ledgerEntries as $entry) {
            $amount = $entry->amount->amount();

            if ($entry->isDebit) {
                $debits = bcadd($debits, $amount, self::SCALE);
            } else {
                $credits = bcadd($credits, $amount, self::SCALE);
            }
        }

        if (bccomp($debits, $credits, self::SCALE) !== 0) {
            throw UnbalancedLedgerException::forTransaction($transactionId, $debits, $credits);
        }

        if ($this->ledger->getEntries($transactionId) !== []) {
            return;
        }

        $this->ledger->insertEntries($transactionId, array_map(function ($entry): array {
            $account = $this->ledger->findAccountByCode($entry->accountCode);

            if ($account === null) {
                throw LedgerAccountNotFoundException::forCode($entry->accountCode);
            }

            return [
                'account_id' => (int) $account['id'],
                'debit' => $entry->isDebit ? $entry->amount->amount() : '0',
                'credit' => $entry->isDebit ? '0' : $entry->amount->amount(),
                'description' => $entry->description,
            ];
        }, $ledgerEntries));
    }

    public function verifyLedgerBalance(int $transactionId): bool
    {
        $debits = '0';
        $credits = '0';

        foreach ($this->ledger->getEntries($transactionId) as $entry) {
            $debits = bcadd($debits, (string) ($entry['debit'] ?? 0), self::SCALE);
            $credits = bcadd($credits, (string) ($entry['credit'] ?? 0), self::SCALE);
        }

        return bccomp($debits, $credits, self::SCALE) === 0;
    }

    public function reconcileTransaction(int $transactionId, string $idempotencyKey): void
    {
        if ($this->ledger->findReconciliation($idempotencyKey) !== null) {
            return;
        }

        $this->ledger->storeReconciliation($transactionId, $idempotencyKey);
    }
}
