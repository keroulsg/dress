<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Infrastructure\Database\Factories;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Domain\Entities\AtelierStaff;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AtelierStaff>
 */
class AtelierStaffFactory extends Factory
{
    protected $model = AtelierStaff::class;

    public function definition(): array
    {
        return [
            'atelier_id' => Atelier::factory(),
            'user_id' => User::factory(),
            'role' => fake()->randomElement(['manager', 'inventory_manager', 'inspector', 'staff']),
            'is_active' => true,
        ];
    }
}
