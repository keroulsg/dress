<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Domain\Entities;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Pricing\Infrastructure\Database\Factories\CouponUsageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CouponUsage extends Model
{
    public const UPDATED_AT = null;

    /** @use HasFactory<CouponUsageFactory> */
    use HasFactory;

    protected $fillable = [
        'coupon_id',
        'user_id',
        'booking_id',
        'discount_applied',
    ];

    protected function casts(): array
    {
        return [
            'discount_applied' => 'decimal:2',
        ];
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    protected static function newFactory(): CouponUsageFactory
    {
        return CouponUsageFactory::new();
    }
}
