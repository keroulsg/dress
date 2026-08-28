<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Infrastructure\Database\Factories;

use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Entities\DressSize;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DressSize>
 */
class DressSizeFactory extends Factory
{
    protected $model = DressSize::class;

    public function definition(): array
    {
        return [
            'dress_id' => Dress::factory(),
            'size_code' => fake()->randomElement(['XS', 'S', 'M', 'L', 'XL', '2XL', 'CUSTOM']),
            'bust' => fake()->randomFloat(2, 60, 140),
            'waist' => fake()->randomFloat(2, 50, 120),
            'hips' => fake()->randomFloat(2, 60, 140),
            'length' => fake()->randomFloat(2, 80, 180),
            'is_available' => true,
        ];
    }
}
