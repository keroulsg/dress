<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Infrastructure\Database\Factories;

use App\Modules\Inspection\Domain\Entities\InspectionDamageItem;
use App\Modules\Inspection\Domain\Entities\InspectionReport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InspectionDamageItem>
 */
class InspectionDamageItemFactory extends Factory
{
    protected $model = InspectionDamageItem::class;

    public function definition(): array
    {
        return [
            'inspection_report_id' => InspectionReport::factory(),
            'location' => fake()->randomElement(['chest', 'waist', 'hem', 'zipper', 'train', 'sleeve', 'bodice', 'lining', 'other']),
            'damage_type' => fake()->randomElement(['stain', 'tear', 'missing_beads', 'broken_zipper', 'alteration', 'burn', 'water_damage', 'irreparable', 'other']),
            'severity' => fake()->randomElement(['minor', 'moderate', 'major', 'critical']),
            'description' => null,
            'repair_cost' => fake()->randomFloat(2, 0, 300),
            'deduction_amount' => fake()->randomFloat(2, 0, 150),
            'photo_path' => null,
        ];
    }
}
