<?php

declare(strict_types=1);

namespace App\Modules\Finance\Infrastructure\Database\Seeders;

use App\Modules\Finance\Domain\Entities\LedgerAccount;
use Illuminate\Database\Seeder;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        foreach ((array) config('finance.default_accounts', []) as $account) {
            LedgerAccount::query()->firstOrCreate(
                ['code' => $account['code']],
                [
                    'name' => $account['name'],
                    'type' => $account['type'],
                    'currency' => 'SAR',
                    'is_active' => true,
                ],
            );
        }
    }
}
