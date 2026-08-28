<?php

declare(strict_types=1);

use App\Modules\Catalog\Http\Controllers\Atelier\DressManagementController;
use App\Modules\Catalog\Http\Controllers\Storefront\CatalogController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function (): void {
    Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
    Route::get('/catalog/{slug}', [CatalogController::class, 'show'])->name('catalog.show');
});

Route::middleware(['web', 'auth', 'atelier'])->prefix('/atelier/{atelier}')->name('atelier.')->group(function (): void {
    Route::get('/dresses', [DressManagementController::class, 'index'])->name('dresses.index');
    Route::get('/dresses/create', [DressManagementController::class, 'create'])->name('dresses.create');
    Route::post('/dresses', [DressManagementController::class, 'store'])->name('dresses.store');
    Route::get('/dresses/{dress}/edit', [DressManagementController::class, 'edit'])->name('dresses.edit');
    Route::put('/dresses/{dress}', [DressManagementController::class, 'update'])->name('dresses.update');
    Route::patch('/dresses/{dress}/publish', [DressManagementController::class, 'togglePublish'])->name('dresses.toggle-publish');
    Route::delete('/dresses/{dress}', [DressManagementController::class, 'destroy'])->name('dresses.destroy');
});
