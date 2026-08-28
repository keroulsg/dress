<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Entities;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Infrastructure\Database\Factories\BookingFactory;
use App\Modules\Dispute\Domain\Entities\Dispute;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Inspection\Domain\Entities\InspectionReport;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Review\Domain\Entities\Review;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_reference',
        'renter_id',
        'atelier_id',
        'fitting_datetime',
        'start_date',
        'end_date',
        'actual_dispatched_at',
        'actual_received_at',
        'actual_returned_at',
        'rental_days_count',
        'rental_rate_total',
        'cleaning_fee_total',
        'security_deposit_amount',
        'late_fee_total',
        'discount_amount',
        'tax_amount',
        'grand_total',
        'deposit_held',
        'deposit_refunded',
        'deposit_deducted',
        'currency',
        'status',
        'cancellation_reason',
        'cancelled_at',
        'cancelled_by',
    ];

    protected function casts(): array
    {
        return [
            'fitting_datetime' => 'datetime',
            'start_date' => 'date',
            'end_date' => 'date',
            'actual_dispatched_at' => 'datetime',
            'actual_received_at' => 'datetime',
            'actual_returned_at' => 'datetime',
            'rental_rate_total' => 'decimal:2',
            'cleaning_fee_total' => 'decimal:2',
            'security_deposit_amount' => 'decimal:2',
            'late_fee_total' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'deposit_held' => 'decimal:2',
            'deposit_refunded' => 'decimal:2',
            'deposit_deducted' => 'decimal:2',
            'status' => BookingStatus::class,
            'cancelled_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function renter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'renter_id');
    }

    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    public function inspectionReports(): HasMany
    {
        return $this->hasMany(InspectionReport::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function scopeActiveRental(Builder $query): Builder
    {
        return $query->whereIn('status', [
            BookingStatus::Confirmed,
            BookingStatus::Dispatched,
            BookingStatus::InCustomerPossession,
        ]);
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query
            ->whereDate('start_date', '>=', now())
            ->whereNotIn('status', [BookingStatus::Cancelled, BookingStatus::Expired]);
    }

    public function isActive(): bool
    {
        return in_array($this->status, [
            BookingStatus::Confirmed,
            BookingStatus::Dispatched,
            BookingStatus::InCustomerPossession,
        ], true);
    }

    protected static function newFactory(): BookingFactory
    {
        return BookingFactory::new();
    }
}
