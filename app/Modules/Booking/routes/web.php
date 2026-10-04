<?php

declare(strict_types=1);

use App\Modules\Booking\Http\Controllers\Atelier\AtelierBookingController;
use App\Modules\Booking\Http\Controllers\Customer\CustomerBookingController;
use App\Modules\Booking\Http\Controllers\Storefront\BookingCheckoutController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function (): void {
    Route::get('/checkout/{dress}', [BookingCheckoutController::class, 'show'])
        ->middleware('auth')
        ->name('checkout.show');

    Route::post('/checkout/{dress}', [BookingCheckoutController::class, 'store'])
        ->middleware(['auth', 'throttle:checkout'])
        ->name('checkout.store');
});

Route::middleware(['web', 'auth'])->prefix('/account')->name('customer.')->group(function (): void {
    Route::get('/bookings', [CustomerBookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [CustomerBookingController::class, 'show'])->name('bookings.show');
    Route::post('/bookings/{booking}/cancel', [CustomerBookingController::class, 'cancel'])->name('bookings.cancel');
    Route::post('/bookings/{booking}/flag-deposit-withheld', [CustomerBookingController::class, 'flagDepositWithheld'])->name('bookings.flagDepositWithheld');
    Route::post('/bookings/{booking}/acknowledge-deposit', [CustomerBookingController::class, 'acknowledgeDeposit'])->name('bookings.acknowledgeDeposit');
});

Route::middleware(['web', 'auth', 'atelier'])->prefix('/atelier/{atelier}')->name('atelier.')->group(function (): void {
    Route::get('/bookings', [AtelierBookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [AtelierBookingController::class, 'show'])->name('bookings.show');
    Route::post('/bookings/{booking}/transition', [AtelierBookingController::class, 'transition'])->name('bookings.transition');
    Route::post('/bookings/{booking}/confirm-deposit-refunded', [AtelierBookingController::class, 'confirmDepositRefunded'])->name('bookings.confirmDepositRefunded');
    Route::post('/bookings/{booking}/damage-claim', [AtelierBookingController::class, 'fileDamageClaim'])->name('bookings.fileDamageClaim');
});
