<?php

declare(strict_types=1);

namespace App\Modules\Media\Application\DTOs;

/**
 * Immutable reference to a stored media asset.
 */
final readonly class StoredAssetDTO
{
    public function __construct(
        public int $assetId,
        public string $purpose,
        public string $disk,
        public string $path,
        public ?string $publicUrl = null,
        public ?string $thumbnailPath = null,
        public ?string $mimeType = null,
        public ?int $size = null,
    ) {}
}
