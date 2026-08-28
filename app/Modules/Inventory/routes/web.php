<?php

declare(strict_types=1);

use App\Modules\Inventory\Http\Controllers\Atelier\InventoryManagementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'atelier'])->prefix('/atelier/{atelier}')->name('atelier.')->group(function (): void {
    Route::post('/dresses/{dress}/availability/block', [InventoryManagementController::class, 'blockDates'])
        ->name('inventory.block');

    Route::post('/dresses/{dress}/inventory/cleaning', [InventoryManagementController::class, 'sendToCleaning'])
        ->name('inventory.cleaning');

    Route::post('/dresses/{dress}/inventory/maintenance', [InventoryManagementController::class, 'startMaintenance'])
        ->name('inventory.maintenance');

    Route::post('/dresses/{dress}/inventory/maintenance/complete', [InventoryManagementController::class, 'completeMaintenance'])
        ->name('inventory.maintenance-complete');
});
