<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Contracts;

use App\Modules\Finance\Application\DTOs\LedgerEntryDTO;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Public contract for atelier commission, payables, and payouts.
 */
interface SettlementContract
{
    /**
     * Computes the atelier payable and platform commission for a captured
     * rental transaction, based on the atelier's configured commission rate.
     *
     * @return array{payable: Money, commission: Money}
     */
    public function calculateSettlement(int $transactionId): array;

    /**
     * Creates a payout for an atelier. Idempotent per payout key.
     */
    public function createPayout(int $atelierId, Money $amount, string $payoutKey): void;

    /**
     * @return list<LedgerEntryDTO>
     */
    public function settlementLedgerEntries(int $transactionId): array;
}
