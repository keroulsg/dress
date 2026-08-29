<?php

declare(strict_types=1);

namespace Tests\Unit\Pricing;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LateFeeCalculationTest extends TestCase
{
    use RefreshDatabase;

    private Dress $dress;

    protected function setUp(): void
    {
        parent::setUp();

        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
        $category = CategoryFactory::new()->create();

        $this->dress = DressFactory::new()->active()->create([
            'atelier_id' => $atelier->id,
            'category_id' => $category->id,
            'late_fee_per_day' => 250,
            'original_retail_value' => 5000,
        ]);
    }

    public function test_zero_late_days_yields_zero_fee(): void
    {
        $fee = app(PricingContract::class)->calculateLateFee($this->dress->id, 0);

        $this->assertTrue($fee->isZero());
    }

    public function test_three_late_days_is_three_times_daily_rate(): void
    {
        $fee = app(PricingContract::class)->calculateLateFee($this->dress->id, 3);

        $this->assertSame('750.0000', $fee->amount());
    }

    public function test_late_fee_is_capped_at_original_retail_value(): void
    {
        $fee = app(PricingContract::class)->calculateLateFee($this->dress->id, 30);

        // 30 × 250 = 7500, capped at 5000.
        $this->assertSame('5000.0000', $fee->amount());
    }

    public function test_negative_late_days_are_clamped_to_zero(): void
    {
        $fee = app(PricingContract::class)->calculateLateFee($this->dress->id, -5);

        $this->assertTrue($fee->isZero());
    }
}
