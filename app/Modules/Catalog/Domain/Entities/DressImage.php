<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Domain\Entities;

use App\Modules\Catalog\Infrastructure\Database\Factories\DressImageFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DressImage extends Model
{
    /** @use HasFactory<DressImageFactory> */
    use HasFactory;

    protected $fillable = [
        'dress_id',
        'image_path',
        'thumbnail_path',
        'display_order',
        'is_primary',
        'alt_text',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_primary' => 'boolean',
        ];
    }

    public function dress(): BelongsTo
    {
        return $this->belongsTo(Dress::class);
    }

    public function scopePrimaryImage(Builder $query): Builder
    {
        return $query->where('is_primary', true);
    }

    public function isPrimary(): bool
    {
        return (bool) $this->is_primary;
    }

    protected static function newFactory(): DressImageFactory
    {
        return DressImageFactory::new();
    }
}
