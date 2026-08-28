<?php

declare(strict_types=1);

namespace App\Modules\Media\Domain\Entities;

use App\Modules\Media\Infrastructure\Database\Factories\MediaAssetFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MediaAsset extends Model
{
    /** @use HasFactory<MediaAssetFactory> */
    use HasFactory;

    protected $fillable = [
        'purpose',
        'disk',
        'path',
        'thumbnail_path',
        'mime_type',
        'size',
        'owner_type',
        'owner_id',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function isPrivate(): bool
    {
        return $this->disk === 'local';
    }

    protected static function newFactory(): MediaAssetFactory
    {
        return MediaAssetFactory::new();
    }
}
