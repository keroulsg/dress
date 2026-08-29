<?php

declare(strict_types=1);

use App\Modules\Inspection\Http\Controllers\Atelier\InspectionWorkspaceController;
use App\Modules\Inspection\Http\Controllers\Customer\CustomerInspectionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'atelier'])->prefix('/atelier/{atelier}')->name('atelier.')->group(function (): void {
    Route::get('/inspections', [InspectionWorkspaceController::class, 'index'])->name('inspections.index');
    Route::get('/inspections/{booking}', [InspectionWorkspaceController::class, 'show'])->name('inspections.show');
    Route::post('/inspections/{booking}/pre-dispatch', [InspectionWorkspaceController::class, 'storePreDispatch'])->name('inspections.pre-dispatch');
    Route::post('/inspections/{booking}/post-return', [InspectionWorkspaceController::class, 'storePostReturn'])->name('inspections.post-return');
    Route::post('/inspections/reports/{report}/finalize', [InspectionWorkspaceController::class, 'finalize'])->name('inspections.finalize');
});

Route::middleware(['web', 'auth'])->prefix('/account')->name('customer.')->group(function (): void {
    Route::get('/bookings/{booking}/inspection', [CustomerInspectionController::class, 'show'])->name('inspections.show');
    Route::post('/bookings/{booking}/inspection/approve', [CustomerInspectionController::class, 'approve'])->name('inspections.approve');
});
