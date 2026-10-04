<?php

declare(strict_types=1);

use App\Modules\Payment\Http\Controllers\PaymentWebhookController;
use App\Modules\Payment\Http\Controllers\PaymobWebhookController;
use App\Modules\Payment\Http\Controllers\Storefront\CheckoutPaymentController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function (): void {
    Route::get('/checkout/{booking}/pay', [CheckoutPaymentController::class, 'showPay'])
        ->name('checkout.pay.show');

    Route::post('/checkout/{booking}/pay', [CheckoutPaymentController::class, 'pay'])
        ->middleware('throttle:checkout')
        ->name('checkout.pay');

    Route::get('/checkout/{booking}/payment-callback', [CheckoutPaymentController::class, 'paymentCallback'])
        ->name('checkout.payment-callback');

    Route::get('/checkout/{booking}/payment-cancel', [CheckoutPaymentController::class, 'paymentCancel'])
        ->name('checkout.payment-cancel');
});

Route::post('/api/payments/webhook', PaymentWebhookController::class)
    ->name('payments.webhook')
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::post('/api/payments/paymob/webhook', PaymobWebhookController::class)
    ->name('payments.paymob.webhook')
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::post('/payments/paymob/webhook', PaymobWebhookController::class)
    ->name('payments.paymob.webhook.alt')
    ->withoutMiddleware([VerifyCsrfToken::class]);
