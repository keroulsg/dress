<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Domain\Entities;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Availability\Domain\Entities\DressAvailability;
use App\Modules\Booking\Domain\Entities\BookingItem;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dress extends Model
{
    /** @use HasFactory<DressFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'atelier_id',
        'category_id',
        'product_type',
        'title',
        'slug',
        'sku',
        'description',
        'fabric_type',
        'silhouette',
        'color_primary',
        'governorate',
        'city',
        'available_for_intercity_shipping',
        'original_retail_value',
        'rental_price_per_day',
        'security_deposit_amount',
        'cleaning_fee',
        'late_fee_per_day',
        'turnaround_buffer_days',
        'condition_rating',
        'listing_mode',
        'allows_rent',
        'allows_sale',
        'status',
        'published_at',
    ];

    protected $appends = [
        'governorate',
        'city',
    ];

    protected function casts(): array
    {
        return [
            'available_for_intercity_shipping' => 'boolean',
            'original_retail_value' => 'decimal:2',
            'rental_price_per_day' => 'decimal:2',
            'security_deposit_amount' => 'decimal:2',
            'cleaning_fee' => 'decimal:2',
            'late_fee_per_day' => 'decimal:2',
            'turnaround_buffer_days' => 'integer',
            'condition_rating' => 'string',
            'listing_mode' => 'string',
            'allows_rent' => 'boolean',
            'allows_sale' => 'boolean',
            'status' => 'string',
            'published_at' => 'datetime',
        ];
    }

    public function getGovernorateAttribute(?string $value): ?string
    {
        return $value ?: $this->atelier?->governorate;
    }

    public function getCityAttribute(?string $value): ?string
    {
        return $value ?: $this->atelier?->city;
    }

    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function sizes(): HasMany
    {
        return $this->hasMany(DressSize::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(DressImage::class)->orderBy('display_order');
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(DressImage::class)->where('is_primary', true);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(DressAvailability::class);
    }

    public function bookingItems(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    public function isRentable(): bool
    {
        return $this->allows_rent && in_array($this->listing_mode, ['rent', 'both'], true);
    }

    public function isForSale(): bool
    {
        return $this->allows_sale || in_array($this->listing_mode, ['sell', 'both'], true);
    }

    public function getProductTypeLabel(): string
    {
        return match ($this->product_type ?? 'dress') {
            'abaya' => 'عباية / قفطان',
            'accessory' => 'إكسسوارات زفاف',
            'jewelry' => 'مجوهرات فاخرة',
            'bag_shoes' => 'حقائب وأحذية',
            'handmade' => 'تصميم هاند ميد',
            default => 'فستان سهرة / زفاف',
        };
    }

    protected static function newFactory(): DressFactory
    {
        return DressFactory::new();
    }
}
