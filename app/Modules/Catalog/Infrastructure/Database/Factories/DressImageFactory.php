<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Infrastructure\Database\Factories;

use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Entities\DressImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DressImage>
 */
class DressImageFactory extends Factory
{
    protected $model = DressImage::class;

    public function definition(): array
    {
        return [
            'dress_id' => Dress::factory(),
            'image_path' => fake()->imageUrl(),
            'thumbnail_path' => fake()->imageUrl(),
            'display_order' => fake()->numberBetween(0, 10),
            'is_primary' => false,
            'alt_text' => fake()->sentence(),
        ];
    }
}
