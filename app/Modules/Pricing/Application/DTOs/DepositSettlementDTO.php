<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Result of settling a security deposit against assessed damage and late fees.
 * The net refundable amount is clamped so it is never negative.
 */
final readonly class DepositSettlementDTO
{
    public function __construct(
        public Money $depositHeld,
        public Money $damageDeduction,
        public Money $lateFeeDeduction,
        public Money $netRefundableAmount,
        public string $currency,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'deposit_held' => $this->depositHeld->jsonSerialize(),
            'damage_deduction' => $this->damageDeduction->jsonSerialize(),
            'late_fee_deduction' => $this->lateFeeDeduction->jsonSerialize(),
            'net_refundable_amount' => $this->netRefundableAmount->jsonSerialize(),
            'currency' => $this->currency,
        ];
    }
}
