<?php

declare(strict_types=1);

namespace App\Modules\Availability\Infrastructure\Database\Factories;

use App\Modules\Availability\Domain\Entities\DressAvailability;
use App\Modules\Availability\Domain\Enums\AvailabilityHoldReason;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DressAvailability>
 */
class DressAvailabilityFactory extends Factory
{
    protected $model = DressAvailability::class;

    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', '+2 months');
        $endDate = (clone $startDate)->modify('+'.fake()->numberBetween(1, 14).' days');

        return [
            'dress_id' => Dress::factory(),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'reason' => fake()->randomElement(AvailabilityHoldReason::cases()),
            'reference_type' => null,
            'reference_id' => null,
        ];
    }
}
