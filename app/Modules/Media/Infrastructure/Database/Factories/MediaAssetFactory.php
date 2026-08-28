<?php

declare(strict_types=1);

namespace App\Modules\Media\Infrastructure\Database\Factories;

use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Media\Domain\Entities\MediaAsset;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MediaAsset>
 */
class MediaAssetFactory extends Factory
{
    protected $model = MediaAsset::class;

    public function definition(): array
    {
        return [
            'purpose' => 'dress_image',
            'disk' => 'public',
            'path' => fake()->filePath(),
            'thumbnail_path' => null,
            'mime_type' => 'image/jpeg',
            'size' => fake()->numberBetween(1000, 500000),
            'owner_type' => Dress::class,
            'owner_id' => null,
        ];
    }

    public function privateAsset(): static
    {
        return $this->state(fn (): array => [
            'disk' => 'local',
            'purpose' => 'kyc_document',
        ]);
    }
}
