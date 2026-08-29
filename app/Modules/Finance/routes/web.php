<?php

declare(strict_types=1);

use App\Modules\Finance\Http\Controllers\Admin\AdminFinanceController;
use App\Modules\Finance\Http\Controllers\Atelier\AtelierFinanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'atelier'])->prefix('/atelier/{atelier}')->name('atelier.')->group(function (): void {
    Route::get('/finance', [AtelierFinanceController::class, 'index'])->name('finance.index');
    Route::post('/finance/payout', [AtelierFinanceController::class, 'requestPayout'])->name('finance.payout');
});

Route::middleware(['web', 'auth'])->prefix('/admin')->name('admin.')->group(function (): void {
    Route::get('/finance', [AdminFinanceController::class, 'index'])->name('finance.index');
    Route::post('/finance/payouts/{payout}/approve', [AdminFinanceController::class, 'approvePayout'])->name('finance.payouts.approve');
});
