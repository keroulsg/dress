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

    /**
     * @return array<string, mixed>|null
     */
    public function findAccountByCode(string $code): ?array;

    /**
     * Sums debits and credits across the entire ledger.
     *
     * @return array{debits: string, credits: string}
     */
    public function globalDebitCreditTotals(): array;

    /**
     * Net payable balance for an atelier (account 2020 credits minus debits).
     */
    public function atelierPayableBalance(int $atelierId): string;

    public function findAtelierCommissionRate(int $transactionId): ?float;

    /**
     * @return array<string, mixed>|null
     */
    public function findPayout(string $payoutKey): ?array;

    /**
     * @return array<string, mixed>|null
     */
    public function findPayoutById(int $payoutId): ?array;

    public function storePayout(array $attributes): int;

    public function markPayoutPaid(int $payoutId): void;
}
