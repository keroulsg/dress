<?php

declare(strict_types=1);

namespace App\Modules\Payment\Infrastructure\Database\Factories;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Payment\Domain\Enums\TransactionStatus;
use App\Modules\Payment\Domain\Enums\TransactionType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'user_id' => User::factory(),
            'atelier_id' => Atelier::factory(),
            'type' => fake()->randomElement(TransactionType::cases()),
            'amount' => fake()->randomFloat(2, 100, 8000),
            'currency' => 'SAR',
            'payment_method' => null,
            'gateway_reference' => Str::uuid(),
            'idempotency_key' => Str::uuid(),
            'status' => fake()->randomElement(TransactionStatus::cases()),
            'metadata_json' => null,
            'processed_at' => null,
        ];
    }

    public function captured(): static
    {
        return $this->state(fn (): array => [
            'status' => TransactionStatus::Captured,
            'processed_at' => now(),
        ]);
    }

    public function refunded(): static
    {
        return $this->state(fn (): array => [
            'status' => TransactionStatus::Refunded,
            'processed_at' => now(),
        ]);
    }
}
