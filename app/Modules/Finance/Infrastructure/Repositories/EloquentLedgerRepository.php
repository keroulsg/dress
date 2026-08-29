<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Repositories;

use App\Modules\Finance\Domain\Entities\AtelierPayout;
use App\Modules\Finance\Domain\Entities\LedgerAccount;
use App\Modules\Finance\Domain\Entities\LedgerEntry;
use App\Modules\Payment\Domain\Entities\Transaction;

class EloquentLedgerRepository implements LedgerRepository
{
    public function __construct(
        private readonly LedgerEntry $ledgerEntry,
        private readonly LedgerAccount $ledgerAccount,
        private readonly AtelierPayout $atelierPayout,
        private readonly Transaction $transaction,
    ) {}

    public function insertEntries(int $transactionId, array $entries): void
    {
        $rows = array_map(static fn (array $entry): array => $entry + [
            'transaction_id' => $transactionId,
            'created_at' => now(),
        ], $entries);

        $this->ledgerEntry->insert($rows);
    }

    public function getEntries(int $transactionId): array
    {
        return $this->ledgerEntry->newQuery()
            ->where('transaction_id', $transactionId)
            ->get()
            ->toArray();
    }

    public function findAccountByCode(string $code): ?array
    {
        return $this->ledgerAccount->newQuery()
            ->where('code', $code)
            ->first()
            ?->toArray();
    }

    public function globalDebitCreditTotals(): array
    {
        $totals = $this->ledgerEntry->newQuery()
            ->selectRaw('SUM(debit) as debits, SUM(credit) as credits')
            ->first();

        return [
            'debits' => (string) ($totals->debits ?? 0),
            'credits' => (string) ($totals->credits ?? 0),
        ];
    }

    public function atelierPayableBalance(int $atelierId): string
    {
        $balance = $this->ledgerEntry->newQuery()
            ->join('ledger_accounts', 'ledger_entries.account_id', '=', 'ledger_accounts.id')
            ->join('transactions', 'ledger_entries.transaction_id', '=', 'transactions.id')
            ->where('ledger_accounts.code', '2020')
            ->where('transactions.atelier_id', $atelierId)
            ->selectRaw('(SUM(ledger_entries.credit) - SUM(ledger_entries.debit)) as balance')
            ->value('balance');

        return (string) ($balance ?? 0);
    }

    public function findAtelierCommissionRate(int $transactionId): ?float
    {
        $transaction = $this->transaction->newQuery()
            ->with('atelier:id,commission_rate')
            ->find($transactionId);

        $rate = $transaction?->atelier?->commission_rate;

        return $rate === null ? null : (float) $rate;
    }

    public function findPayout(string $payoutKey): ?array
    {
        return $this->atelierPayout->newQuery()
            ->where('payout_key', $payoutKey)
            ->first()
            ?->toArray();
    }

    public function findPayoutById(int $payoutId): ?array
    {
        return $this->atelierPayout->newQuery()->find($payoutId)?->toArray();
    }

    public function storePayout(array $attributes): int
    {
        return $this->atelierPayout->newQuery()->create($attributes)->id;
    }

    public function markPayoutPaid(int $payoutId): void
    {
        $this->atelierPayout->newQuery()->whereKey($payoutId)->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}
