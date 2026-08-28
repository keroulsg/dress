<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Immutable pricing breakdown for a booking.
 *
 * The security deposit is held as a liability and is reported separately from
 * the amount charged for the rental itself.
 */
final readonly class PricingBreakdownDTO
{
    public function __construct(
        public Money $rentalSubtotal,
        public Money $cleaningFee,
        public Money $taxAmount,
        public Money $discountAmount,
        public Money $securityDeposit,
        public Money $grandTotal,
        public Money $amountChargeable,
        public int $rentalDays,
        public string $currency,
    ) {}
}
