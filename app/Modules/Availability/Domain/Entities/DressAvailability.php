<?php

declare(strict_types=1);

namespace App\Modules\Availability\Domain\Entities;

use App\Modules\Availability\Domain\Enums\AvailabilityHoldReason;
use App\Modules\Availability\Infrastructure\Database\Factories\DressAvailabilityFactory;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DressAvailability extends Model
{
    /** @use HasFactory<DressAvailabilityFactory> */
    use HasFactory;

    protected $fillable = [
        'dress_id',
        'start_date',
        'end_date',
        'reason',
        'reference_type',
        'reference_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'reason' => AvailabilityHoldReason::class,
            'reference_type' => 'string',
            'reference_id' => 'integer',
        ];
    }

    public function dress(): BelongsTo
    {
        return $this->belongsTo(Dress::class);
    }

    public function scopeActiveBetween(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query
            ->where('start_date', '<=', $endDate)
            ->where('end_date', '>=', $startDate);
    }

    public function scopeForReference(Builder $query, string $referenceType, int $referenceId): Builder
    {
        return $query
            ->where('reference_type', $referenceType)
            ->where('reference_id', $referenceId);
    }

    protected static function newFactory(): DressAvailabilityFactory
    {
        return DressAvailabilityFactory::new();
    }
}
