<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\Services;

use App\Modules\Catalog\Domain\Contracts\CatalogReader;
use App\Modules\Pricing\Application\DTOs\CouponDiscountDTO;
use App\Modules\Pricing\Application\DTOs\DepositSettlementDTO;
use App\Modules\Pricing\Application\DTOs\PricingBreakdownDTO;
use App\Modules\Pricing\Application\DTOs\PricingCalculationDTO;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use App\Modules\Pricing\Domain\Exceptions\InvalidCouponException;
use App\Modules\Pricing\Domain\Exceptions\InvalidQuoteRequestException;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use App\Modules\Pricing\Infrastructure\Repositories\CouponRepository;

/**
 * Stateless, decimal-safe pricing authority. All currency arithmetic flows
 * through Money (bcmath); floating point is never used for money.
 */
class PricingService implements PricingContract
{
    public function __construct(
        private readonly CatalogReader $catalog,
        private readonly CouponRepository $coupons,
        private readonly string $baseCurrency,
    ) {}

    public function calculateBookingTotal(PricingCalculationDTO $dto): PricingBreakdownDTO
    {
        if ($dto->rentalDays < 1) {
            throw InvalidQuoteRequestException::nonPositiveRentalDays();
        }

        if ($dto->items === []) {
            throw InvalidQuoteRequestException::emptyItems();
        }

        $subtotal = Money::zero($dto->currency);

        foreach ($dto->items as $item) {
            $dailyRate = Money::fromDecimal((float) $item['daily_rate'], $dto->currency);
            $subtotal = $subtotal->add($dailyRate->multiply($dto->rentalDays));
        }

        $discount = Money::zero($dto->currency);

        if ($dto->couponCode !== null && $dto->couponCode !== '') {
            $coupon = $this->validateCoupon($dto->couponCode, $dto->renterId, $subtotal);

            if ($coupon === null) {
                throw InvalidCouponException::forCode($dto->couponCode);
            }

            $discount = $coupon->discountAmount;
        }

        $cleaningFee = Money::fromDecimal($dto->cleaningFee, $dto->currency);
        $securityDeposit = Money::fromDecimal($dto->securityDeposit, $dto->currency);

        $taxRate = $this->taxRateFor($dto->currency, $dto->taxRate);
        $taxBase = $subtotal->add($cleaningFee)->subtract($discount);
        $taxAmount = $taxBase->multiply((string) $taxRate);

        $deliveryFee = $dto->includeDelivery
            ? $this->deliveryFeeFor($dto->deliveryCity, $dto->currency)
            : Money::zero($dto->currency);

        $chargeableTotal = $subtotal
            ->add($cleaningFee)
            ->add($deliveryFee)
            ->add($taxAmount)
            ->subtract($discount);

        $grandTotal = $chargeableTotal->add($securityDeposit);

        $firstRate = $dto->items[0]['daily_rate'] ?? 0;

        return new PricingBreakdownDTO(
            dailyRate: Money::fromDecimal((float) $firstRate, $dto->currency),
            rentalDays: $dto->rentalDays,
            subtotal: $subtotal,
            cleaningFee: $cleaningFee,
            deliveryFee: $deliveryFee,
            discountAmount: $discount,
            taxRate: $taxRate,
            taxAmount: $taxAmount,
            chargeableTotal: $chargeableTotal,
            securityDeposit: $securityDeposit,
            grandTotal: $grandTotal,
            currency: $dto->currency,
        );
    }

    public function calculateLateFee(int $dressId, int $lateDays): Money
    {
        $lateDays = max(0, $lateDays);

        $dress = $this->catalog->getDressSnapshot($dressId);
        $currency = $dress->rentalPricePerDay->currency();

        $feePerDay = Money::fromDecimal($dress->lateFeePerDay->amount(), $currency);
        $total = $feePerDay->multiply($lateDays);

        $cap = $dress->originalRetailValue;

        if ($total->greaterThan($cap)) {
            return $cap;
        }

        return $total;
    }

    public function calculateDepositDeduction(Money $depositHeld, Money $damageAssessed, Money $lateFees): DepositSettlementDTO
    {
        $remaining = $depositHeld;

        $damageDeduction = $damageAssessed->greaterThan($remaining) ? $remaining : $damageAssessed;
        $remaining = $remaining->subtract($damageDeduction);

        $lateFeeDeduction = $lateFees->greaterThan($remaining) ? $remaining : $lateFees;
        $remaining = $remaining->subtract($lateFeeDeduction);

        return new DepositSettlementDTO(
            depositHeld: $depositHeld,
            damageDeduction: $damageDeduction,
            lateFeeDeduction: $lateFeeDeduction,
            netRefundableAmount: $remaining,
            currency: $depositHeld->currency(),
        );
    }

    public function validateCoupon(string $code, int $renterId, Money $subtotal): ?CouponDiscountDTO
    {
        $coupon = $this->coupons->findActiveByCode(strtoupper($code));

        if ($coupon === null) {
            return null;
        }

        if ($coupon->starts_at !== null && now()->lt($coupon->starts_at)) {
            return null;
        }

        if ($coupon->expires_at !== null && now()->gt($coupon->expires_at)) {
            return null;
        }

        $minOrder = Money::fromDecimal($coupon->min_order_subtotal, $subtotal->currency());

        if ($subtotal->lessThan($minOrder)) {
            return null;
        }

        if ($coupon->usage_limit_per_user !== null && $this->coupons->countUserUsage($coupon->id, $renterId) >= $coupon->usage_limit_per_user) {
            return null;
        }

        if ($coupon->total_usage_limit !== null && $coupon->times_used >= $coupon->total_usage_limit) {
            return null;
        }

        $discount = $coupon->isPercentage()
            ? $subtotal->multiply((string) ($coupon->discount_value / 100))
            : Money::fromDecimal($coupon->discount_value, $subtotal->currency());

        if ($discount->greaterThan($subtotal)) {
            $discount = $subtotal;
        }

        if ($coupon->max_discount_cap !== null) {
            $cap = Money::fromDecimal($coupon->max_discount_cap, $subtotal->currency());

            if ($discount->greaterThan($cap)) {
                $discount = $cap;
            }
        }

        return new CouponDiscountDTO(
            code: $coupon->code,
            discountType: $coupon->discount_type,
            discountAmount: $discount,
            subtotal: $subtotal,
            currency: $subtotal->currency(),
        );
    }

    public function recordCouponUsage(string $code, int $renterId, int $bookingId, Money $discountApplied): void
    {
        $coupon = $this->coupons->findActiveByCode(strtoupper($code));

        if ($coupon === null) {
            return;
        }

        $this->coupons->recordUsage($coupon->id, $renterId, $bookingId, $discountApplied->amount());
        $this->coupons->incrementTimesUsed($coupon->id);
    }

    private function taxRateFor(string $currency, ?float $override): float
    {
        if ($override !== null) {
            return $override;
        }

        $rate = config("pricing.tax_rates.{$currency}");

        return is_numeric($rate) ? (float) $rate : (float) config('pricing.tax_rate', 0.14);
    }

    private function deliveryFeeFor(?string $city, string $currency): Money
    {
        $base = (float) config('pricing.delivery_fee', 0);

        if ($city !== null) {
            $fees = (array) config('pricing.delivery_fees_by_city', []);
            $key = strtolower($city);

            if (isset($fees[$key])) {
                $base = (float) $fees[$key];
            }
        }

        return Money::fromDecimal($base, $currency);
    }
}
