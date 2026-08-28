<?php

declare(strict_types=1);

namespace App\Modules\Payment\Infrastructure\Database\Factories;

use App\Modules\Payment\Domain\Entities\PaymentIdempotencyKey;
use App\Modules\Payment\Domain\Entities\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PaymentIdempotencyKey>
 */
class PaymentIdempotencyKeyFactory extends Factory
{
    protected $model = PaymentIdempotencyKey::class;

    public function definition(): array
    {
        return [
            'idempotency_key' => Str::uuid()->toString(),
            'operation' => fake()->randomElement(['authorize', 'capture', 'refund', 'deposit_release']),
            'transaction_id' => Transaction::factory(),
        ];
    }
}
