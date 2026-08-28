<?php

declare(strict_types=1);

use App\Modules\KYC\Http\Controllers\KycDocumentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function (): void {
    Route::post('/kyc/documents', [KycDocumentController::class, 'store'])
        ->middleware('throttle:kyc-upload')
        ->name('kyc.documents.store');

    Route::get('/kyc/documents/{verification}', [KycDocumentController::class, 'show'])
        ->name('kyc.documents.show');
});
