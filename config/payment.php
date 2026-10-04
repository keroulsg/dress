<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Gateway Driver
    |--------------------------------------------------------------------------
    |
    | Supported: "mock", "paymob"
    |
    */

    'gateway' => env('PAYMENT_GATEWAY', 'mock'),

    /*
    |--------------------------------------------------------------------------
    | Paymob Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration options for Paymob Unified Checkout (Accept).
    |
    */

    'paymob' => [
        'api_key' => env('PAYMOB_API_KEY', ''),
        'public_key' => env('PAYMOB_PUBLIC_KEY', ''),
        'secret_key' => env('PAYMOB_SECRET_KEY', ''),
        'hmac_secret' => env('PAYMOB_HMAC_SECRET', ''),
        'integration_id_card' => env('PAYMOB_INTEGRATION_ID_CARD', ''),
        'integration_id_wallet' => env('PAYMOB_INTEGRATION_ID_WALLET', ''),
        'iframe_id' => env('PAYMOB_IFRAME_ID', ''),
        'base_url' => env('PAYMOB_BASE_URL', 'https://accept.paymob.com/api'),
    ],

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
