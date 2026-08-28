<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Database\Factories;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Finance\Domain\Entities\AtelierPayout;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AtelierPayout>
 */
class AtelierPayoutFactory extends Factory
{
    protected $model = AtelierPayout::class;

    public function definition(): array
    {
        return [
            'atelier_id' => Atelier::factory(),
            'payout_key' => Str::uuid()->toString(),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'currency' => 'SAR',
            'status' => 'pending',
            'paid_at' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (): array => [
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}
