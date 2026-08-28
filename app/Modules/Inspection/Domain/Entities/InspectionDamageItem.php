<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Domain\Entities;

use App\Modules\Inspection\Infrastructure\Database\Factories\InspectionDamageItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionDamageItem extends Model
{
    /** @use HasFactory<InspectionDamageItemFactory> */
    use HasFactory;

    protected $fillable = [
        'inspection_report_id',
        'location',
        'damage_type',
        'severity',
        'description',
        'repair_cost',
        'deduction_amount',
        'photo_path',
    ];

    protected function casts(): array
    {
        return [
            'repair_cost' => 'decimal:2',
            'deduction_amount' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(InspectionReport::class);
    }

    protected static function newFactory(): InspectionDamageItemFactory
    {
        return InspectionDamageItemFactory::new();
    }
}
