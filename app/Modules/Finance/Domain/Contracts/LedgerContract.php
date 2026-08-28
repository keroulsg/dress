<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Contracts;

use App\Modules\Finance\Application\DTOs\LedgerEntryDTO;

/**
 * Public contract for the Finance module ledger.
 *
 * Finance owns double-entry bookkeeping. Payment, Inspection, and Dispute
 * post through this contract and never write ledger tables directly.
 */
interface LedgerContract
{
    /**
     * Records a balanced journal for a business transaction. Rejected unless
     * total debits equal total credits. Idempotent per transaction id.
     *
     * @param  list<LedgerEntryDTO>  $ledgerEntries
     */
    public function recordTransaction(int $transactionId, array $ledgerEntries): void;

    /**
     * Verifies that the journal of a transaction is balanced.
     */
    public function verifyLedgerBalance(int $transactionId): bool;

    /**
     * Reconciles a transaction by idempotency key to guarantee at-most-once posting.
     */
    public function reconcileTransaction(int $transactionId, string $idempotencyKey): void;
}
