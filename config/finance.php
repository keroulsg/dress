<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Default Ledger Accounts
    |--------------------------------------------------------------------------
    |
    | Seeded by FinanceSeeder. Codes are stable identifiers referenced by
    | DoubleEntryLedgerService.
    |
    */

    'default_accounts' => [
        ['code' => '1010', 'name' => 'Gateway Escrow / Cash', 'type' => 'asset'],
        ['code' => '2010', 'name' => 'Customer Security Deposits Held', 'type' => 'liability'],
        ['code' => '2020', 'name' => 'Atelier Payable - Net Rent & Damage', 'type' => 'liability'],
        ['code' => '2030', 'name' => 'Atelier Payable - Cleaning Fees', 'type' => 'liability'],
        ['code' => '4010', 'name' => 'Platform Commission Revenue', 'type' => 'revenue'],
        ['code' => '5010', 'name' => 'Gateway Processing Expense', 'type' => 'expense'],
    ],
];
