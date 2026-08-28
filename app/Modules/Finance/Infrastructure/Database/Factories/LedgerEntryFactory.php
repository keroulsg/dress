<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Database\Factories;

use App\Modules\Finance\Domain\Entities\LedgerAccount;
use App\Modules\Finance\Domain\Entities\LedgerEntry;
use App\Modules\Payment\Domain\Entities\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LedgerEntry>
 */
class LedgerEntryFactory extends Factory
{
    protected $model = LedgerEntry::class;

    public function definition(): array
    {
        $amount = fake()->randomFloat(2, 100, 8000);
        $isDebit = fake()->boolean();

        return [
            'transaction_id' => Transaction::factory(),
            'account_id' => LedgerAccount::factory(),
            'debit' => $isDebit ? $amount : 0.00,
            'credit' => $isDebit ? 0.00 : $amount,
            'description' => fake()->sentence(),
            'created_at' => now(),
        ];
    }
}
