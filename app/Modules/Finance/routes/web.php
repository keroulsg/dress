<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\AdminAtelierController;
use App\Http\Controllers\Admin\AdminAuditController;
use App\Http\Controllers\Admin\AdminBookingController;
use App\Http\Controllers\Admin\AdminCatalogController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminDisputeController;
use App\Http\Controllers\Admin\AdminKycController;
use App\Http\Controllers\Admin\AdminPaymentController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Modules\Finance\Http\Controllers\Admin\AdminFinanceController;
use App\Modules\Finance\Http\Controllers\Atelier\AtelierFinanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'atelier'])->prefix('/atelier/{atelier}')->name('atelier.')->group(function (): void {
    Route::get('/finance', [AtelierFinanceController::class, 'index'])->name('finance.index');
    Route::post('/finance/payout', [AtelierFinanceController::class, 'requestPayout'])->name('finance.payout');
});

Route::middleware(['web', 'auth', 'superadmin'])->prefix('/admin')->name('admin.')->group(function (): void {
    // Dashboard & Finance
    Route::get('/', [AdminFinanceController::class, 'index'])->name('dashboard');
    Route::get('/finance', [AdminFinanceController::class, 'index'])->name('finance.index');
    Route::post('/finance/payouts/{payout}/approve', [AdminFinanceController::class, 'approvePayout'])->name('finance.payouts.approve');

    // Categories
    Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

    // Users
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::put('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.update-role');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    // Ateliers
    Route::get('/ateliers', [AdminAtelierController::class, 'index'])->name('ateliers.index');
    Route::patch('/ateliers/{atelier}/toggle-status', [AdminAtelierController::class, 'toggleStatus'])->name('ateliers.toggle-status');
    Route::put('/ateliers/{atelier}/commission', [AdminAtelierController::class, 'updateCommission'])->name('ateliers.update-commission');

    // Catalog
    Route::get('/catalog', [AdminCatalogController::class, 'index'])->name('catalog.index');
    Route::patch('/catalog/{dress}/toggle-publish', [AdminCatalogController::class, 'togglePublish'])->name('catalog.toggle-publish');
    Route::delete('/catalog/{dress}', [AdminCatalogController::class, 'destroy'])->name('catalog.destroy');

    // Bookings
    Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings.index');
    Route::patch('/bookings/{booking}/cancel', [AdminBookingController::class, 'cancel'])->name('bookings.cancel');

    // Payments
    Route::get('/payments', [AdminPaymentController::class, 'index'])->name('payments.index');

    // Disputes
    Route::get('/disputes', [AdminDisputeController::class, 'index'])->name('disputes.index');
    Route::post('/disputes/{dispute}/resolve', [AdminDisputeController::class, 'resolve'])->name('disputes.resolve');

    // KYC
    Route::get('/kyc', [AdminKycController::class, 'index'])->name('kyc.index');
    Route::post('/kyc/{kyc}/review', [AdminKycController::class, 'review'])->name('kyc.review');

    // Reviews
    Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
    Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

    // Audit Log
    Route::get('/audit', [AdminAuditController::class, 'index'])->name('audit.index');

    // Settings
    Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
});
