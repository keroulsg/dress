<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Immutable, deterministic pricing breakdown.
 *
 * chargeableTotal = subtotal + cleaning + delivery + tax - discount
 * grandTotal      = chargeableTotal + securityDeposit (authorized hold)
 *
 * The security deposit is a refundable liability, never revenue.
 */
final readonly class PricingBreakdownDTO
{
    public function __construct(
        public Money $dailyRate,
        public int $rentalDays,
        public Money $subtotal,
        public Money $cleaningFee,
        public Money $deliveryFee,
        public Money $discountAmount,
        public float $taxRate,
        public Money $taxAmount,
        public Money $chargeableTotal,
        public Money $securityDeposit,
        public Money $grandTotal,
        public string $currency,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'daily_rate' => $this->dailyRate->jsonSerialize(),
            'rental_days' => $this->rentalDays,
            'subtotal' => $this->subtotal->jsonSerialize(),
            'cleaning_fee' => $this->cleaningFee->jsonSerialize(),
            'delivery_fee' => $this->deliveryFee->jsonSerialize(),
            'discount_amount' => $this->discountAmount->jsonSerialize(),
            'tax_rate' => $this->taxRate,
            'tax_amount' => $this->taxAmount->jsonSerialize(),
            'chargeable_total' => $this->chargeableTotal->jsonSerialize(),
            'security_deposit' => $this->securityDeposit->jsonSerialize(),
            'grand_total' => $this->grandTotal->jsonSerialize(),
            'currency' => $this->currency,
        ];
    }
}
