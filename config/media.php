<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Storage Disks
    |--------------------------------------------------------------------------
    |
    | Public assets (dress photography) and private assets (KYC documents,
    | inspection evidence) are deliberately separated.
    |
    */

    'public_disk' => 'public',

    'private_disk' => 'local',

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],

    'max_file_size_kb' => (int) env('MEDIA_MAX_FILE_SIZE_KB', 10240),

    'thumbnail_size' => ['width' => 480, 'height' => 640],
];
