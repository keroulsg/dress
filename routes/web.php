<?php

use App\Http\Controllers\Atelier\AtelierStudioController;
use App\Http\Controllers\Customer\AccountHubController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\ProfileController;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/terms', [LegalController::class, 'terms'])->name('legal.terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('legal.privacy');
Route::get('/refund-policy', [LegalController::class, 'refundPolicy'])->name('legal.refund-policy');
Route::get('/shipping-policy', [LegalController::class, 'shippingPolicy'])->name('legal.shipping-policy');
Route::get('/contact', [LegalController::class, 'contact'])->name('legal.contact');
Route::post('/contact', [LegalController::class, 'submitContact'])->name('legal.contact.submit');

Route::get('/foundation', function () {
    return Inertia::render('Foundation');
})->name('foundation');

Route::get('/dashboard', function () {
    $user = auth()->user();
    if ($user?->isSuperadmin()) {
        return redirect()->route('admin.finance.index');
    }
    if ($user?->role === 'atelier_owner') {
        $atelier = $user->ateliers()->first();
        if ($atelier) {
            return redirect()->route('atelier.dresses.index', ['atelier' => $atelier->id]);
        }
    }

    return redirect()->route('account.overview');
})->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->prefix('account')->name('account.')->group(function () {
    Route::get('/', [AccountHubController::class, 'overview'])->name('overview');
    Route::get('/overview', [AccountHubController::class, 'overview'])->name('overview.direct');
    Route::get('/saved', [AccountHubController::class, 'saved'])->name('saved');
    Route::get('/payments', [AccountHubController::class, 'payments'])->name('payments');
    Route::get('/disputes', [AccountHubController::class, 'disputes'])->name('disputes');
    Route::get('/reviews', [AccountHubController::class, 'reviews'])->name('reviews');
    Route::get('/kyc', [AccountHubController::class, 'kyc'])->name('kyc');
    Route::get('/profile', [AccountHubController::class, 'profile'])->name('profile');
});

Route::get('/atelier', function () {
    $user = auth()->user();
    if ($user?->role === 'atelier_owner') {
        $atelier = $user->ateliers()->first();
        if ($atelier) {
            return redirect()->route('atelier.overview', ['atelier' => $atelier->id]);
        }
    }

    if ($user?->isSuperadmin()) {
        return redirect()->route('atelier.overview', ['atelier' => 1]);
    }

    abort(403, 'غير مصرح لك بالوصول. لوحة التحكم مخصصة لصاحبة الأتيليه فقط.');
})->middleware(['auth'])->name('atelier.root');

Route::middleware(['web', 'auth', 'atelier'])->prefix('/atelier/{atelier}')->name('atelier.')->group(function () {
    Route::get('/', [AtelierStudioController::class, 'overview'])->name('overview');
    Route::get('/calendar', [AtelierStudioController::class, 'calendar'])->name('calendar');
    Route::get('/inventory', [AtelierStudioController::class, 'inventory'])->name('inventory');
    Route::get('/settings', [AtelierStudioController::class, 'settings'])->name('settings');
    Route::put('/settings', [AtelierStudioController::class, 'updateSettings'])->name('settings.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

if (app()->isLocal()) {
    Route::get('/dev/switch/{role}', function (string $role) {
        $user = match ($role) {
            'admin', 'superadmin' => User::where('email', 'admin@dress.test')->first(),
            'owner', 'atelier' => User::where('email', 'owner0@dress.test')->first(),
            'renter', 'customer' => User::where('email', 'renter0@dress.test')->first(),
            default => null,
        };

        if ($user) {
            auth()->login($user);
            request()->session()->regenerate();

            if ($user->isSuperadmin()) {
                return redirect('/admin/kyc')->with('status', 'تم التبديل بنجاح إلى حساب مدير المنصة (admin@dress.test).');
            }

            if ($user->role === 'atelier_owner') {
                return redirect('/atelier/1/dresses')->with('status', 'تم التبديل بنجاح إلى حساب صاحبة الأتيليه (owner0@dress.test).');
            }

            return redirect('/account/overview')->with('status', 'تم التبديل بنجاح إلى حساب المستأجرة (renter0@dress.test).');
        }

        return redirect('/');
    })->name('dev.switch');
}

require __DIR__.'/auth.php';
