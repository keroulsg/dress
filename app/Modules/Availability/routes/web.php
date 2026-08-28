<?php

declare(strict_types=1);

use App\Modules\Availability\Http\Controllers\Storefront\AvailabilityQueryController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function (): void {
    Route::get('/api/dresses/{dress}/availability-calendar', [AvailabilityQueryController::class, 'calendar'])
        ->name('availability.calendar');

    Route::post('/api/dresses/{dress}/validate-range', [AvailabilityQueryController::class, 'validateRange'])
        ->name('availability.validate-range');
});
