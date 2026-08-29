<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Contracts;

use App\Modules\Finance\Application\DTOs\LedgerEntryDTO;
use App\Modules\Finance\Domain\Entities\AtelierPayout;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Public contract for the Finance module ledger.
 *
 * Finance owns double-entry bookkeeping. Every journal is balanced
 * (sum(debits) === sum(credits)) and append-only; adjustments require reversal
 * entries. Other modules post through this contract only.
 */
interface LedgerContract
{
    public function recordBookingCapture(Transaction $transaction, Money $rentalSubtotal, Money $cleaningFee, Money $depositAmount, Money $commissionAmount): void;

    public function recordDepositSettlement(Transaction $transaction, Money $depositHeld, Money $deductionAmount, Money $refundAmount): void;

    public function recordCustomerRefund(Transaction $transaction, Money $refundAmount, Money $reversalCommission): void;

    public function recordAtelierPayout(AtelierPayout $payout, Transaction $transaction): void;

    /**
     * Verifies the journal of a single transaction (or the entire ledger when
     * no transaction id is given) is balanced.
     */
    public function verifyLedgerBalance(?int $transactionId = null): bool;

    public function getAtelierAvailableBalance(int $atelierId): Money;

    /**
     * Low-level balanced posting. Throws UnbalancedLedgerEntryException unless
     * total debits equal total credits.
     *
     * @param  list<LedgerEntryDTO>  $ledgerEntries
     */
    public function recordTransaction(int $transactionId, array $ledgerEntries): void;
}
