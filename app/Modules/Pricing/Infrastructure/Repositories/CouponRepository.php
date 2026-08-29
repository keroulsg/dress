<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Infrastructure\Repositories;

use App\Modules\Pricing\Domain\Entities\Coupon;

interface CouponRepository
{
    public function findActiveByCode(string $code): ?Coupon;

    public function countUserUsage(int $couponId, int $userId): int;

    public function recordUsage(int $couponId, int $userId, ?int $bookingId, string $discountApplied): void;

    public function incrementTimesUsed(int $couponId): void;
}
