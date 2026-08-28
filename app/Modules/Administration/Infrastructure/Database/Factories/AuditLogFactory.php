<?php

declare(strict_types=1);

namespace App\Modules\Administration\Infrastructure\Database\Factories;

use App\Modules\Administration\Domain\Entities\AuditLog;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditLog>
 */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'user_id' => fake()->boolean() ? User::factory() : null,
            'action' => fake()->word(),
            'auditable_type' => Dress::class,
            'auditable_id' => fake()->numberBetween(1, 100000),
            'old_values_json' => fake()->boolean() ? ['status' => fake()->word()] : null,
            'new_values_json' => fake()->boolean() ? ['status' => fake()->word()] : null,
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'created_at' => now(),
        ];
    }
}
