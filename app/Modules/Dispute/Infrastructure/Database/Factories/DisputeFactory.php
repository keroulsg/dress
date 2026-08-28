<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Infrastructure\Database\Factories;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Dispute\Domain\Entities\Dispute;
use App\Modules\Dispute\Domain\Enums\DisputeStatus;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Dispute>
 */
class DisputeFactory extends Factory
{
    protected $model = Dispute::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'opened_by' => User::factory(),
            'reason' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(DisputeStatus::cases())->value,
            'resolution' => null,
            'resolved_by' => null,
            'resolved_at' => null,
        ];
    }

    public function resolved(): static
    {
        return $this->state(fn (): array => [
            'status' => DisputeStatus::Resolved->value,
            'resolution' => fake()->paragraph(),
            'resolved_by' => User::factory(),
            'resolved_at' => now(),
        ]);
    }
}
