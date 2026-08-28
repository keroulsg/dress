<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Database\Factories;

use App\Modules\Finance\Domain\Entities\LedgerReconciliation;
use App\Modules\Payment\Domain\Entities\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LedgerReconciliation>
 */
class LedgerReconciliationFactory extends Factory
{
    protected $model = LedgerReconciliation::class;

    public function definition(): array
    {
        return [
            'transaction_id' => Transaction::factory(),
            'idempotency_key' => Str::uuid()->toString(),
        ];
    }
}
