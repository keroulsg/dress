<?php

declare(strict_types=1);

namespace Tests\Feature\Pricing;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\Pricing\Domain\Entities\Coupon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuoteApiTest extends TestCase
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
            'rental_price_per_day' => 500,
            'cleaning_fee' => 150,
            'security_deposit_amount' => 2000,
            'turnaround_buffer_days' => 2,
        ]);
    }

    public function test_quote_endpoint_returns_accurate_breakdown(): void
    {
        $start = now()->addDays(3)->toDateString();
        $end = now()->addDays(5)->toDateString();

        $this->postJson('/api/pricing/quote', [
            'dress_id' => $this->dress->id,
            'start_date' => $start,
            'end_date' => $end,
            'delivery_requested' => false,
        ])
            ->assertOk()
            ->assertJsonPath('rental_days', 3)
            ->assertJsonPath('subtotal.amount', '1500')
            ->assertJsonPath('cleaning_fee.amount', '150')
            ->assertJsonPath('tax_rate', 0.14)
            ->assertJsonPath('security_deposit.amount', '2000')
            ->assertJsonPath('grand_total.amount', '3881');
    }

    public function test_quote_applies_valid_coupon(): void
    {
        Coupon::query()->create([
            'code' => 'WELCOME10',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'max_discount_cap' => 100,
            'usage_limit_per_user' => 1,
        ]);

        $start = now()->addDays(3)->toDateString();
        $end = now()->addDays(5)->toDateString();

        $this->postJson('/api/pricing/quote', [
            'dress_id' => $this->dress->id,
            'start_date' => $start,
            'end_date' => $end,
            'coupon_code' => 'welcome10',
        ])
            ->assertOk()
            ->assertJsonPath('discount_amount.amount', '100');
    }

    public function test_quote_rejects_invalid_dates_with_422(): void
    {
        $this->postJson('/api/pricing/quote', [
            'dress_id' => $this->dress->id,
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('start_date');
    }

    public function test_validate_coupon_endpoint_returns_preview_or_rejection(): void
    {
        Coupon::query()->create([
            'code' => 'FLAT50',
            'discount_type' => 'fixed',
            'discount_value' => 50,
            'usage_limit_per_user' => 1,
        ]);

        $start = now()->addDays(3)->toDateString();
        $end = now()->addDays(5)->toDateString();

        $this->postJson('/api/pricing/validate-coupon', [
            'dress_id' => $this->dress->id,
            'start_date' => $start,
            'end_date' => $end,
            'coupon_code' => 'FLAT50',
        ])
            ->assertOk()
            ->assertJsonPath('valid', true)
            ->assertJsonPath('discount_amount.amount', '50');

        $this->postJson('/api/pricing/validate-coupon', [
            'dress_id' => $this->dress->id,
            'start_date' => $start,
            'end_date' => $end,
            'coupon_code' => 'NOPE',
        ])
            ->assertOk()
            ->assertJsonPath('valid', false);
    }

    public function test_inactive_coupon_rejected_in_quote(): void
    {
        Coupon::query()->create([
            'code' => 'OLD',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'is_active' => false,
            'usage_limit_per_user' => 1,
        ]);

        $start = now()->addDays(3)->toDateString();
        $end = now()->addDays(5)->toDateString();

        $this->postJson('/api/pricing/quote', [
            'dress_id' => $this->dress->id,
            'start_date' => $start,
            'end_date' => $end,
            'coupon_code' => 'OLD',
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Coupon "OLD" is invalid or cannot be applied to this order.');
    }
}
