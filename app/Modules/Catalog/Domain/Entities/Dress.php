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
use Illuminate\Database\Eloquent\SoftDeletes;

class Dress extends Model
{
    /** @use HasFactory<DressFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'atelier_id',
        'category_id',
        'title',
        'slug',
        'sku',
        'description',
        'fabric_type',
        'silhouette',
        'color_primary',
        'original_retail_value',
        'rental_price_per_day',
        'security_deposit_amount',
        'cleaning_fee',
        'late_fee_per_day',
        'turnaround_buffer_days',
        'condition_rating',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'original_retail_value' => 'decimal:2',
            'rental_price_per_day' => 'decimal:2',
            'security_deposit_amount' => 'decimal:2',
            'cleaning_fee' => 'decimal:2',
            'late_fee_per_day' => 'decimal:2',
            'turnaround_buffer_days' => 'integer',
            'condition_rating' => 'string',
            'status' => 'string',
            'published_at' => 'datetime',
        ];
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

    public function availabilities(): HasMany
    {
        return $this->hasMany(DressAvailability::class);
    }

    public function bookingItems(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    protected static function newFactory(): DressFactory
    {
        return DressFactory::new();
    }
}
