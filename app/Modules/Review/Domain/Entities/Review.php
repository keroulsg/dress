<?php

declare(strict_types=1);

namespace App\Modules\Review\Domain\Entities;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Review\Infrastructure\Database\Factories\ReviewFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    /** @use HasFactory<ReviewFactory> */
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'renter_id',
        'dress_id',
        'atelier_id',
        'rating',
        'comment',
        'atelier_reply',
        'atelier_replied_at',
    ];

    protected function casts(): array
    {
        return [
            'atelier_replied_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function renter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'renter_id');
    }

    public function dress(): BelongsTo
    {
        return $this->belongsTo(Dress::class);
    }

    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class);
    }

    protected static function newFactory(): ReviewFactory
    {
        return ReviewFactory::new();
    }
}
