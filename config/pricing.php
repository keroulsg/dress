<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Base Currency
    |--------------------------------------------------------------------------
    |
    | ISO 4217 currency the platform quotes in by default.
    |
    */

    'currency' => env('PRICING_CURRENCY', 'EGP'),

    /*
    |--------------------------------------------------------------------------
    | Supported Currencies
    |--------------------------------------------------------------------------
    */

    'supported_currencies' => ['EGP', 'SAR', 'USD'],

    /*
    |--------------------------------------------------------------------------
    | Default Tax Rate
    |--------------------------------------------------------------------------
    |
    | Applied to the rental subtotal. Overridable per atelier in later phases.
    |
    */

    'tax_rate' => env('PRICING_TAX_RATE', 0.14),
];
