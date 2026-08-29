<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Infrastructure\Repositories;

use App\Modules\Pricing\Domain\Entities\Coupon;
use App\Modules\Pricing\Domain\Entities\CouponUsage;

class EloquentCouponRepository implements CouponRepository
{
    public function __construct(
        private readonly Coupon $coupon,
        private readonly CouponUsage $usage,
    ) {}

    public function findActiveByCode(string $code): ?Coupon
    {
        return $this->coupon->newQuery()
            ->where('code', $code)
            ->where('is_active', true)
            ->first();
    }

    public function countUserUsage(int $couponId, int $userId): int
    {
        return $this->usage->newQuery()
            ->where('coupon_id', $couponId)
            ->where('user_id', $userId)
            ->count();
    }

    public function recordUsage(int $couponId, int $userId, ?int $bookingId, string $discountApplied): void
    {
        $this->usage->newQuery()->create([
            'coupon_id' => $couponId,
            'user_id' => $userId,
            'booking_id' => $bookingId,
            'discount_applied' => $discountApplied,
        ]);
    }

    public function incrementTimesUsed(int $couponId): void
    {
        $this->coupon->newQuery()->whereKey($couponId)->increment('times_used');
    }
}
