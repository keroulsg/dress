<?php

use App\Modules\Storefront\Http\Controllers\Storefront\CatalogController;
use App\Modules\Storefront\Http\Controllers\Storefront\DressShowController;
use App\Modules\Storefront\Http\Controllers\Storefront\HomeController;
use App\Modules\Storefront\Http\Controllers\Storefront\SearchSuggestionsController;
use App\Modules\Storefront\Http\Controllers\Storefront\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('storefront.home');
Route::get('/catalog', [CatalogController::class, 'index'])->name('storefront.catalog');
Route::get('/dresses/{slug}', [DressShowController::class, 'show'])->name('storefront.dress.show');
Route::get('/search/suggestions', [SearchSuggestionsController::class, 'index'])->name('storefront.search.suggestions');

Route::middleware(['auth'])->group(function () {
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('storefront.wishlist.toggle');
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('storefront.wishlist.index');
});
