<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Entities;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Finance\Infrastructure\Database\Factories\AtelierPayoutFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AtelierPayout extends Model
{
    /** @use HasFactory<AtelierPayoutFactory> */
    use HasFactory;

    protected $fillable = [
        'atelier_id',
        'payout_key',
        'amount',
        'currency',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    protected static function newFactory(): AtelierPayoutFactory
    {
        return AtelierPayoutFactory::new();
    }
}
