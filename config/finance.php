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
        ['code' => '1010', 'name' => 'Gateway Escrow Receivable', 'type' => 'asset'],
        ['code' => '2010', 'name' => 'Customer Security Deposit Held', 'type' => 'liability'],
        ['code' => '2020', 'name' => 'Atelier Payable - Rental', 'type' => 'liability'],
        ['code' => '2030', 'name' => 'Atelier Payable - Cleaning Fee', 'type' => 'liability'],
        ['code' => '4010', 'name' => 'Platform Commission', 'type' => 'revenue'],
    ],
];
