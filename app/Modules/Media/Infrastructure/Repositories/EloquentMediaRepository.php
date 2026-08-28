<?php

declare(strict_types=1);

namespace App\Modules\Media\Infrastructure\Repositories;

use App\Modules\Media\Domain\Entities\MediaAsset;

class EloquentMediaRepository implements MediaRepository
{
    public function create(array $attributes): MediaAsset
    {
        return MediaAsset::query()->create($attributes);
    }

    public function find(int $assetId): ?MediaAsset
    {
        return MediaAsset::query()->find($assetId);
    }

    public function delete(int $assetId): bool
    {
        return (bool) MediaAsset::query()->whereKey($assetId)->delete();
    }
}
