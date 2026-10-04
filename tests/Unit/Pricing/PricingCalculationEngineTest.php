<?php

declare(strict_types=1);

namespace Tests\Unit\Pricing;

use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\Pricing\Application\DTOs\PricingCalculationDTO;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use App\Modules\Pricing\Domain\Entities\Coupon;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingCalculationEngineTest extends TestCase
{
    use RefreshDatabase;

    private function pricing(): PricingContract
    {
        return app(PricingContract::class);
    }

    private function dto(array $overrides = []): PricingCalculationDTO
    {
        return new PricingCalculationDTO(
            renterId: 1,
            atelierId: 1,
            items: [['dress_id' => 1, 'daily_rate' => $overrides['daily_rate'] ?? 500]],
            startDate: now()->addDays(1),
            endDate: now()->addDays($overrides['days'] ?? 3),
            rentalDays: $overrides['days'] ?? 3,
            cleaningFee: $overrides['cleaning'] ?? 150,
            securityDeposit: $overrides['deposit'] ?? 2000,
            currency: 'EGP',
            isDailyBilling: $overrides['is_daily'] ?? true,
        );
    }

    public function test_exact_math_for_one_day_rental(): void
    {
        $breakdown = $this->pricing()->calculateBookingTotal($this->dto(['days' => 1]));

        $this->assertSame('500.0000', $breakdown->subtotal->amount());
        // tax base = subtotal + cleaning = 500 + 150 = 650; 14% = 91
        $this->assertSame('91.0000', $breakdown->taxAmount->amount());
        $this->assertSame('741.0000', $breakdown->chargeableTotal->amount());
        $this->assertSame('2741.0000', $breakdown->grandTotal->amount());
    }

    public function test_exact_math_for_three_day_rental(): void
    {
        $breakdown = $this->pricing()->calculateBookingTotal($this->dto(['days' => 3]));

        $this->assertSame('1500.0000', $breakdown->subtotal->amount());
        // (1500 + 150) × 0.14 = 231
        $this->assertSame('231.0000', $breakdown->taxAmount->amount());
        $this->assertSame('1881.0000', $breakdown->chargeableTotal->amount());
        $this->assertSame('3881.0000', $breakdown->grandTotal->amount());
    }

    public function test_exact_math_for_seven_day_rental(): void
    {
        $breakdown = $this->pricing()->calculateBookingTotal($this->dto(['days' => 7, 'daily_rate' => 333]));

        $this->assertSame('2331.0000', $breakdown->subtotal->amount());
        // (2331 + 150) × 0.14 = 347.34
        $this->assertSame('347.3400', $breakdown->taxAmount->amount());
        $this->assertSame('2828.3400', $breakdown->chargeableTotal->amount());
    }

    public function test_flat_period_fee_and_dynamic_25_percent_deposit(): void
    {
        // 400 EGP rental price with is_daily = false (flat event window) and deposit = 0 (defaults to 25%)
        $breakdown = $this->pricing()->calculateBookingTotal($this->dto([
            'days' => 3,
            'daily_rate' => 400,
            'cleaning' => 50,
            'deposit' => 0,
            'is_daily' => false,
        ]));

        // Base rental fee remains flat 400 (NOT 400 x 3)
        $this->assertSame('400.0000', $breakdown->subtotal->amount());
        // Dynamic deposit is exactly 25% of 400 = 100 EGP
        $this->assertSame('100.0000', $breakdown->securityDeposit->amount());
        // totalBookingValue = 400 + 50 = 450
        $this->assertSame('450.0000', $breakdown->totalBookingValue->amount());
        // upfrontReservationFee = 10% of 450 = 45 EGP
        $this->assertSame('45.0000', $breakdown->upfrontReservationFee->amount());
        // offlineSettlementBalance = 90% of 450 (405) + 100 deposit = 505 EGP
        $this->assertSame('505.0000', $breakdown->offlineSettlementBalance->amount());
    }

    public function test_deposit_is_never_taxed(): void
    {
        $withDeposit = $this->pricing()->calculateBookingTotal($this->dto(['days' => 3, 'deposit' => 5000]));
        $withoutDeposit = $this->pricing()->calculateBookingTotal($this->dto(['days' => 3, 'deposit' => 0]));

        // Tax identical regardless of deposit.
        $this->assertSame($withoutDeposit->taxAmount->amount(), $withDeposit->taxAmount->amount());
        // Deposit added only to grand total (authorized hold), not chargeable.
        $this->assertSame($withoutDeposit->chargeableTotal->amount(), $withDeposit->chargeableTotal->amount());
        $this->assertSame(
            bcadd($withoutDeposit->chargeableTotal->amount(), '5000.0000', 4),
            $withDeposit->grandTotal->amount(),
        );
    }

    public function test_percentage_coupon_with_cap(): void
    {
        $user = UserFactory::new()->renter()->create();
        $coupon = Coupon::query()->create([
            'code' => 'CAP10',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'max_discount_cap' => 100,
            'usage_limit_per_user' => 1,
        ]);

        $dto = new PricingCalculationDTO(
            renterId: $user->id,
            atelierId: 1,
            items: [['dress_id' => 1, 'daily_rate' => 500]],
            startDate: now()->addDays(1),
            endDate: now()->addDays(3),
            rentalDays: 3,
            cleaningFee: 150,
            securityDeposit: 2000,
            couponCode: 'CAP10',
            currency: 'EGP',
        );

        $breakdown = $this->pricing()->calculateBookingTotal($dto);

        // 10% of 1500 = 150, capped at 100.
        $this->assertSame('100.0000', $breakdown->discountAmount->amount());
        // tax base = (1500 + 150) - 100 = 1550; 14% = 217
        $this->assertSame('217.0000', $breakdown->taxAmount->amount());
    }

    public function test_fixed_coupon_never_exceeds_subtotal(): void
    {
        $user = UserFactory::new()->renter()->create();
        Coupon::query()->create([
            'code' => 'FIXBIG',
            'discount_type' => 'fixed',
            'discount_value' => 9999,
            'usage_limit_per_user' => 1,
        ]);

        $dto = new PricingCalculationDTO(
            renterId: $user->id,
            atelierId: 1,
            items: [['dress_id' => 1, 'daily_rate' => 500]],
            startDate: now()->addDays(1),
            endDate: now()->addDays(3),
            rentalDays: 3,
            cleaningFee: 150,
            securityDeposit: 2000,
            couponCode: 'FIXBIG',
            currency: 'EGP',
        );

        $breakdown = $this->pricing()->calculateBookingTotal($dto);

        // Capped at subtotal (1500); chargeable = 1500+150 - 1500 + tax(150×0.14=21) = 171.
        $this->assertSame('1500.0000', $breakdown->discountAmount->amount());
        $this->assertSame('171.0000', $breakdown->chargeableTotal->amount());
    }

    public function test_coupon_minimum_spend_and_expiration(): void
    {
        $user = UserFactory::new()->renter()->create();

        $minSpend = Coupon::query()->create([
            'code' => 'MIN500',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'min_order_subtotal' => 5000,
            'usage_limit_per_user' => 1,
        ]);

        $expired = Coupon::query()->create([
            'code' => 'OLDPROMO',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'expires_at' => now()->subDay(),
            'usage_limit_per_user' => 1,
        ]);

        $subtotal = Money::fromDecimal(1500, 'EGP');

        $this->assertNull($this->pricing()->validateCoupon('MIN500', $user->id, $subtotal));
        $this->assertNull($this->pricing()->validateCoupon('OLDPROMO', $user->id, $subtotal));

        $this->assertNotNull($this->pricing()->validateCoupon('MIN500', $user->id, Money::fromDecimal(6000, 'EGP')));
    }
}
