<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Database\Factories;

use App\Modules\Finance\Domain\Entities\LedgerAccount;
use App\Modules\Finance\Domain\Enums\LedgerAccountType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LedgerAccount>
 */
class LedgerAccountFactory extends Factory
{
    protected $model = LedgerAccount::class;

    public function definition(): array
    {
        return [
            'code' => fake()->unique()->numerify('####'),
            'name' => fake()->words(2, true),
            'type' => fake()->randomElement(LedgerAccountType::cases()),
            'currency' => 'SAR',
            'is_active' => true,
        ];
    }
}
