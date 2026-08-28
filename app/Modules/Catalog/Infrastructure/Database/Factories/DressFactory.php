<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Infrastructure\Database\Factories;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Dress>
 */
class DressFactory extends Factory
{
    protected $model = Dress::class;

    public function definition(): array
    {
        return [
            'atelier_id' => Atelier::factory(),
            'category_id' => Category::factory(),
            'title' => fake()->unique()->words(3, true),
            'slug' => fake()->unique()->slug(),
            'sku' => Str::upper(fake()->unique()->bothify('DR-####')),
            'description' => fake()->paragraph(),
            'fabric_type' => fake()->randomElement(['silk', 'chiffon', 'satin', 'tulle', 'lace']),
            'silhouette' => fake()->randomElement(['A-line', 'mermaid', 'ballgown', 'sheath']),
            'color_primary' => fake()->safeColorName(),
            'original_retail_value' => fake()->randomFloat(2, 500, 8000),
            'rental_price_per_day' => fake()->randomFloat(2, 100, 8000),
            'security_deposit_amount' => fake()->randomFloat(2, 100, 8000),
            'cleaning_fee' => fake()->randomFloat(2, 100, 8000),
            'late_fee_per_day' => fake()->randomFloat(2, 100, 8000),
            'turnaround_buffer_days' => fake()->numberBetween(1, 5),
            'condition_rating' => fake()->randomElement(['brand_new', 'like_new', 'good', 'minor_flaws']),
            'status' => 'draft',
            'published_at' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (): array => [
            'status' => 'active',
            'published_at' => now(),
        ]);
    }

    public function retired(): static
    {
        return $this->state(fn (): array => [
            'status' => 'retired',
            'published_at' => null,
        ]);
    }
}
