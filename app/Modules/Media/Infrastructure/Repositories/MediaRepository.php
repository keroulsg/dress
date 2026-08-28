<?php

declare(strict_types=1);

namespace App\Modules\Media\Infrastructure\Repositories;

use App\Modules\Media\Domain\Entities\MediaAsset;

interface MediaRepository
{
    public function create(array $attributes): MediaAsset;

    public function find(int $assetId): ?MediaAsset;

    public function delete(int $assetId): bool;
}
