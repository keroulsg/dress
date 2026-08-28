<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | KYC
    |--------------------------------------------------------------------------
    |
    | Identity documents are sensitive: they are stored on the private disk,
    | never in public storage, and their paths are never exposed to clients.
    |
    */

    'document_types' => [
        'national_id',
        'passport',
    ],

    'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],

    'max_file_size_kb' => (int) env('KYC_MAX_FILE_SIZE_KB', 5120),

    'verification_statuses' => ['pending', 'approved', 'rejected', 'expired'],
];
