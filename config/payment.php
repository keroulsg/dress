<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Gateway
    |--------------------------------------------------------------------------
    |
    | Fail-closed by default. A concrete adapter is wired here in Phase 8.
    |
    */

    'gateway' => env('PAYMENT_GATEWAY', 'unconfigured'),

    /*
    |--------------------------------------------------------------------------
    | Idempotency
    |--------------------------------------------------------------------------
    |
    | How long idempotency keys remain valid before they may be reused.
    |
    */

    'idempotency_ttl_seconds' => (int) env('PAYMENT_IDEMPOTENCY_TTL', 86400),

    /*
    |--------------------------------------------------------------------------
    | Transaction Types
    |--------------------------------------------------------------------------
    */

    'transaction_types' => [
        'rental_payment',
        'deposit_authorization',
        'deposit_capture',
        'deposit_release',
        'deposit_penalty',
        'customer_refund',
        'atelier_payout',
        'platform_commission',
        'tax',
        'adjustment',
    ],
];
