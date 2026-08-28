<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Infrastructure\Database\Factories;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Atelier>
 */
class AtelierFactory extends Factory
{
    protected $model = Atelier::class;

    public function definition(): array
    {
        return [
            'owner_user_id' => User::factory(),
            'business_name' => fake()->company(),
            'slug' => fake()->unique()->slug(),
            'license_number' => fake()->unique()->numerify('LIC-#######'),
            'description' => fake()->paragraph(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'phone' => fake()->unique()->numerify('05########'),
            'email' => fake()->unique()->safeEmail(),
            'commission_rate' => fake()->randomFloat(2, 1, 20),
            'is_active' => true,
            'approved_at' => null,
            'approved_by' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (): array => [
            'approved_at' => now(),
            'approved_by' => User::factory(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (): array => [
            'approved_at' => null,
            'approved_by' => null,
        ]);
    }
}
