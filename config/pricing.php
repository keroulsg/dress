<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Base Currency
    |--------------------------------------------------------------------------
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
    | Tax Rates by Currency
    |--------------------------------------------------------------------------
    |
    | VAT is applied strictly to (subtotal + cleaning fee - discount). The
    | security deposit is a liability and is NEVER taxed.
    |
    */

    'tax_rates' => [
        'EGP' => 0.14, // Egypt VAT
        'SAR' => 0.15, // Saudi VAT
        'USD' => 0.00, // No VAT (illustrative)
    ],

    /*
    |--------------------------------------------------------------------------
    | Fallback Tax Rate
    |--------------------------------------------------------------------------
    */

    'tax_rate' => env('PRICING_TAX_RATE', 0.14),

    /*
    |--------------------------------------------------------------------------
    | Delivery Fees
    |--------------------------------------------------------------------------
    |
    | Base white-glove delivery fee, plus optional city-specific overrides.
    |
    */

    'delivery_fee' => (float) env('PRICING_DELIVERY_FEE', 0),

    'delivery_fees_by_city' => [
        'riyadh' => 50.00,
        'cairo' => 40.00,
        'jeddah' => 60.00,
    ],
];
