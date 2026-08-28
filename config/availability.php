<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Default Turnaround Buffer
    |--------------------------------------------------------------------------
    |
    | Extra calendar days added around a confirmed rental during which the
    | dress is unavailable, giving the atelier time to clean and prepare it.
    |
    */

    'default_buffer_days' => 2,

    /*
    |--------------------------------------------------------------------------
    | Hold Reference Types
    |--------------------------------------------------------------------------
    |
    | Values allowed in the reference_type column of availability holds.
    |
    */

    'hold_reference_types' => [
        'confirmed_booking',
        'rental_hold',
        'fitting',
        'in_transit',
        'cleaning',
        'alteration',
        'maintenance',
        'manual_block',
    ],
];
