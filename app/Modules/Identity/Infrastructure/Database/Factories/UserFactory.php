<?php

declare(strict_types=1);

namespace App\Modules\Identity\Infrastructure\Database\Factories;

use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->unique()->numerify('01########'),
            'password' => 'password',
            'role' => 'renter',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'rating_average' => 5.0,
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (): array => [
            'email_verified_at' => null,
            'phone_verified_at' => null,
        ]);
    }

    public function superadmin(): static
    {
        return $this->state(fn (): array => ['role' => 'superadmin']);
    }

    public function atelierOwner(): static
    {
        return $this->state(fn (): array => ['role' => 'atelier_owner']);
    }

    public function atelierStaff(): static
    {
        return $this->state(fn (): array => ['role' => 'atelier_staff']);
    }

    public function renter(): static
    {
        return $this->state(fn (): array => ['role' => 'renter']);
    }
}
