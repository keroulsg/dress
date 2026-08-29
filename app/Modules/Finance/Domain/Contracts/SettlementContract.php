<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Contracts;

use App\Modules\Finance\Domain\Entities\AtelierPayout;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Public contract for atelier commission, payables, and payouts.
 */
interface SettlementContract
{
    /**
     * Computes the atelier payable and platform commission for a rental
     * subtotal, based on the atelier's configured commission rate.
     *
     * @return array{payable: Money, commission: Money}
     */
    public function calculateAtelierPayable(Money $rentalSubtotal, float $commissionRate): array;

    /**
     * Creates a payout request for an atelier. Rejected when it exceeds the
     * atelier's available settled balance. Idempotent per payout key.
     */
    public function createPayout(int $atelierId, Money $amount, string $payoutKey): AtelierPayout;

    /**
     * Executes a payout: posts the balanced clearing journal and marks the
     * payout as paid.
     */
    public function processPayout(AtelierPayout $payout, Transaction $transaction): void;
}
