<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Infrastructure\Database\Factories;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Inspection\Domain\Entities\InspectionReport;
use App\Modules\Inspection\Domain\Enums\InspectionPhase;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InspectionReport>
 */
class InspectionReportFactory extends Factory
{
    protected $model = InspectionReport::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'inspector_id' => User::factory(),
            'phase' => fake()->randomElement(InspectionPhase::cases()),
            'condition_summary' => fake()->randomElement(['perfect', 'normal_wear', 'stain_repairable', 'torn_repairable', 'total_loss']),
            'damage_description' => null,
            'recommended_deposit_deduction' => fake()->randomFloat(2, 0, 500),
            'approved_deposit_deduction' => 0.00,
            'customer_approved' => false,
            'customer_approved_at' => null,
        ];
    }

    public function preDispatch(): static
    {
        return $this->state(fn (): array => ['phase' => InspectionPhase::PreDispatch]);
    }

    public function postReturn(): static
    {
        return $this->state(fn (): array => ['phase' => InspectionPhase::PostReturn]);
    }
}
