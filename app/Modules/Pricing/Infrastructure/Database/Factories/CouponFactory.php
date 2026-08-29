<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Infrastructure\Database\Factories;

use App\Modules\Pricing\Domain\Entities\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'code' => Str::upper(Str::random(8)),
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'min_order_subtotal' => 0,
            'max_discount_cap' => null,
            'usage_limit_per_user' => 1,
            'total_usage_limit' => null,
            'times_used' => 0,
            'starts_at' => null,
            'expires_at' => null,
            'is_active' => true,
        ];
    }

    public function percentage(int $value, ?int $cap = null): static
    {
        return $this->state(fn (): array => [
            'discount_type' => 'percentage',
            'discount_value' => $value,
            'max_discount_cap' => $cap,
        ]);
    }

    public function fixed(float $value): static
    {
        return $this->state(fn (): array => [
            'discount_type' => 'fixed',
            'discount_value' => $value,
        ]);
    }

    public function minOrder(float $min): static
    {
        return $this->state(fn (): array => ['min_order_subtotal' => $min]);
    }

    public function expired(): static
    {
        return $this->state(fn (): array => [
            'expires_at' => now()->subDay(),
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
