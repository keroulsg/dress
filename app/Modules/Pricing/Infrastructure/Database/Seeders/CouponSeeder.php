<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Infrastructure\Database\Seeders;

use App\Modules\Pricing\Domain\Entities\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::query()->updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'discount_type' => 'percentage',
                'discount_value' => 10.00,
                'min_order_subtotal' => 500.00,
                'max_discount_cap' => 300.00,
                'usage_limit_per_user' => 1,
                'is_active' => true,
            ],
        );

        Coupon::query()->updateOrCreate(
            ['code' => 'FLAT50'],
            [
                'discount_type' => 'fixed',
                'discount_value' => 50.00,
                'min_order_subtotal' => 300.00,
                'max_discount_cap' => null,
                'usage_limit_per_user' => 2,
                'is_active' => true,
            ],
        );

        Coupon::query()->updateOrCreate(
            ['code' => 'LAUNCH15'],
            [
                'discount_type' => 'percentage',
                'discount_value' => 15.00,
                'min_order_subtotal' => 0.00,
                'max_discount_cap' => 500.00,
                'usage_limit_per_user' => 1,
                'is_active' => true,
            ],
        );

        $this->command?->info('Coupons seeded: WELCOME10, FLAT50, LAUNCH15.');
    }
}
