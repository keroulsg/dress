<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Domain\Contracts;

use App\Modules\Pricing\Application\DTOs\CouponDiscountDTO;
use App\Modules\Pricing\Application\DTOs\DepositSettlementDTO;
use App\Modules\Pricing\Application\DTOs\PricingBreakdownDTO;
use App\Modules\Pricing\Application\DTOs\PricingCalculationDTO;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Public contract for the Pricing module.
 *
 * Pricing is the single source of truth for rental calculations, taxes, fees,
 * discounts, deposits, and late penalties. All arithmetic is decimal-safe.
 * Frontend totals are display-only; the backend recalculates on every write.
 */
interface PricingContract
{
    public function calculateBookingTotal(PricingCalculationDTO $dto): PricingBreakdownDTO;

    /**
     * Late fee = max(0, lateDays) × late_fee_per_day, capped at the dress's
     * original retail value.
     */
    public function calculateLateFee(int $dressId, int $lateDays): Money;

    /**
     * Deducts assessed damage and late fees from the held deposit, clamping to
     * zero. The net refundable amount is never negative.
     */
    public function calculateDepositDeduction(Money $depositHeld, Money $damageAssessed, Money $lateFees): DepositSettlementDTO;

    /**
     * Validates a coupon for a renter against an order subtotal. Returns null
     * when the coupon is invalid, inactive, expired, under minimum spend, or
     * has exceeded usage limits.
     */
    public function validateCoupon(string $code, int $renterId, Money $subtotal): ?CouponDiscountDTO;

    /**
     * Records a successful coupon application against a booking and increments
     * the coupon's usage counters.
     */
    public function recordCouponUsage(string $code, int $renterId, int $bookingId, Money $discountApplied): void;
}
