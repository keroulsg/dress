<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Domain\Entities;

use App\Modules\Pricing\Infrastructure\Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'min_order_subtotal',
        'max_discount_cap',
        'usage_limit_per_user',
        'total_usage_limit',
        'times_used',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'min_order_subtotal' => 'decimal:2',
            'max_discount_cap' => 'decimal:2',
            'usage_limit_per_user' => 'integer',
            'total_usage_limit' => 'integer',
            'times_used' => 'integer',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isPercentage(): bool
    {
        return $this->discount_type === 'percentage';
    }

    protected static function newFactory(): CouponFactory
    {
        return CouponFactory::new();
    }
}
