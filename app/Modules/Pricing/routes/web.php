<?php

declare(strict_types=1);

use App\Modules\Pricing\Http\Controllers\Storefront\PricingQuoteController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function (): void {
    Route::post('/api/pricing/quote', [PricingQuoteController::class, 'quote'])
        ->name('pricing.quote');

    Route::post('/api/pricing/validate-coupon', [PricingQuoteController::class, 'validateCoupon'])
        ->name('pricing.validate-coupon');
});
