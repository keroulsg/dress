<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Domain\Entities;

use App\Modules\Catalog\Infrastructure\Database\Factories\DressSizeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DressSize extends Model
{
    /** @use HasFactory<DressSizeFactory> */
    use HasFactory;

    protected $fillable = [
        'dress_id',
        'size_code',
        'bust',
        'waist',
        'hips',
        'length',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'size_code' => 'string',
            'bust' => 'decimal:2',
            'waist' => 'decimal:2',
            'hips' => 'decimal:2',
            'length' => 'decimal:2',
            'is_available' => 'boolean',
        ];
    }

    public function dress(): BelongsTo
    {
        return $this->belongsTo(Dress::class);
    }

    protected static function newFactory(): DressSizeFactory
    {
        return DressSizeFactory::new();
    }
}
