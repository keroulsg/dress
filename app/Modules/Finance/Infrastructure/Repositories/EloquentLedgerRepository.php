<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Repositories;

use App\Modules\Finance\Domain\Entities\AtelierPayout;
use App\Modules\Finance\Domain\Entities\LedgerAccount;
use App\Modules\Finance\Domain\Entities\LedgerEntry;
use App\Modules\Finance\Domain\Entities\LedgerReconciliation;
use App\Modules\Payment\Domain\Entities\Transaction;

class EloquentLedgerRepository implements LedgerRepository
{
    public function __construct(
        private readonly LedgerEntry $ledgerEntry,
        private readonly LedgerAccount $ledgerAccount,
        private readonly LedgerReconciliation $reconciliation,
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
        return $this->ledgerEntry
            ->where('transaction_id', $transactionId)
            ->get()
            ->toArray();
    }

    public function findReconciliation(string $idempotencyKey): ?array
    {
        return $this->reconciliation
            ->where('idempotency_key', $idempotencyKey)
            ->first()
            ?->toArray();
    }

    public function storeReconciliation(int $transactionId, string $idempotencyKey): void
    {
        $this->reconciliation->create([
            'transaction_id' => $transactionId,
            'idempotency_key' => $idempotencyKey,
            'created_at' => now(),
        ]);
    }

    public function findAccountByCode(string $code): ?array
    {
        return $this->ledgerAccount
            ->where('code', $code)
            ->first()
            ?->toArray();
    }

    public function findTransactionAmountMinor(int $transactionId): ?int
    {
        $amount = $this->transaction->whereKey($transactionId)->value('amount');

        return $amount === null ? null : (int) round((float) $amount * 100);
    }

    public function findTransactionCurrency(int $transactionId): ?string
    {
        $currency = $this->transaction->whereKey($transactionId)->value('currency');

        return $currency === null ? null : (string) $currency;
    }

    public function findAtelierCommissionRate(int $transactionId): ?float
    {
        $transaction = $this->transaction
            ->with('atelier:id,commission_rate')
            ->find($transactionId);

        $rate = $transaction?->atelier?->commission_rate;

        return $rate === null ? null : (float) $rate;
    }

    public function findPayout(string $payoutKey): ?array
    {
        return $this->atelierPayout->where('payout_key', $payoutKey)->first()?->toArray();
    }

    public function storePayout(array $attributes): void
    {
        $this->atelierPayout->create($attributes);
    }
}
