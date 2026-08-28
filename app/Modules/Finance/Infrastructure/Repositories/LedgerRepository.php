<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Repositories;

interface LedgerRepository
{
    /**
     * @param  list<array{account_id: int, debit: string, credit: string, description?: string|null}>  $entries
     */
    public function insertEntries(int $transactionId, array $entries): void;

    /**
     * @return list<array<string, mixed>>
     */
    public function getEntries(int $transactionId): array;

    public function findReconciliation(string $idempotencyKey): ?array;

    public function storeReconciliation(int $transactionId, string $idempotencyKey): void;

    /**
     * @return array<string, mixed>|null
     */
    public function findAccountByCode(string $code): ?array;

    public function findTransactionAmountMinor(int $transactionId): ?int;

    public function findTransactionCurrency(int $transactionId): ?string;

    public function findAtelierCommissionRate(int $transactionId): ?float;

    /**
     * @return array<string, mixed>|null
     */
    public function findPayout(string $payoutKey): ?array;

    public function storePayout(array $attributes): void;
}
