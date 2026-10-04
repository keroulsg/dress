<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Domain\Entities;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Dispute\Domain\Enums\DisputeStatus;
use App\Modules\Dispute\Infrastructure\Database\Factories\DisputeFactory;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dispute extends Model
{
    /** @use HasFactory<DisputeFactory> */
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'opened_by',
        'reason',
        'description',
        'status',
        'resolution',
        'resolved_by',
        'resolved_at',
        'arbitrator_id',
        'arbitration_status',
        'arbitration_resolution',
        'resolution_amount',
    ];

    protected function casts(): array
    {
        return [
            'status' => DisputeStatus::class,
            'resolved_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'resolution_amount' => 'decimal:2',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function opener(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function arbitrator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'arbitrator_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(DisputeMessage::class);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereIn('status', [
            DisputeStatus::Open->value,
            DisputeStatus::UnderReview->value,
            DisputeStatus::AwaitingCustomer->value,
            DisputeStatus::AwaitingAtelier->value,
        ]);
    }

    protected static function newFactory(): DisputeFactory
    {
        return DisputeFactory::new();
    }
}
