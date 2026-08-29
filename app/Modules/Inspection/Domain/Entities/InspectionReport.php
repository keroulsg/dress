<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Domain\Entities;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Inspection\Domain\Enums\InspectionPhase;
use App\Modules\Inspection\Infrastructure\Database\Factories\InspectionReportFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InspectionReport extends Model
{
    /** @use HasFactory<InspectionReportFactory> */
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'inspector_id',
        'phase',
        'condition_summary',
        'damage_description',
        'recommended_deposit_deduction',
        'approved_deposit_deduction',
        'customer_approved',
        'customer_approved_at',
        'finalized_at',
        'finalized_by',
    ];

    protected function casts(): array
    {
        return [
            'phase' => InspectionPhase::class,
            'recommended_deposit_deduction' => 'decimal:2',
            'approved_deposit_deduction' => 'decimal:2',
            'customer_approved' => 'boolean',
            'customer_approved_at' => 'datetime',
            'finalized_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function damageItems(): HasMany
    {
        return $this->hasMany(InspectionDamageItem::class);
    }

    public function scopePreDispatch(Builder $query): Builder
    {
        return $query->where('phase', InspectionPhase::PreDispatch);
    }

    public function scopePostReturn(Builder $query): Builder
    {
        return $query->where('phase', InspectionPhase::PostReturn);
    }

    protected static function newFactory(): InspectionReportFactory
    {
        return InspectionReportFactory::new();
    }
}
