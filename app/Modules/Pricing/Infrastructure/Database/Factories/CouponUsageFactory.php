<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Infrastructure\Database\Factories;

use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Pricing\Domain\Entities\Coupon;
use App\Modules\Pricing\Domain\Entities\CouponUsage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CouponUsage>
 */
class CouponUsageFactory extends Factory
{
    protected $model = CouponUsage::class;

    public function definition(): array
    {
        return [
            'coupon_id' => Coupon::factory(),
            'user_id' => User::factory(),
            'booking_id' => null,
            'discount_applied' => fake()->randomFloat(2, 1, 100),
        ];
    }
}
