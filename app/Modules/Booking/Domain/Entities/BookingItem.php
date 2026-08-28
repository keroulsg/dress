<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Entities;

use App\Modules\Booking\Infrastructure\Database\Factories\BookingItemFactory;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Entities\DressSize;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingItem extends Model
{
    /** @use HasFactory<BookingItemFactory> */
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'dress_id',
        'dress_size_id',
        'quantity',
        'unit_rental_price',
        'rental_days',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'unit_rental_price' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function dress(): BelongsTo
    {
        return $this->belongsTo(Dress::class);
    }

    public function dressSize(): BelongsTo
    {
        return $this->belongsTo(DressSize::class);
    }

    protected static function newFactory(): BookingItemFactory
    {
        return BookingItemFactory::new();
    }
}
