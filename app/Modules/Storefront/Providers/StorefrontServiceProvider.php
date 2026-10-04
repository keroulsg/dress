<?php

declare(strict_types=1);

namespace App\Modules\Storefront\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class StorefrontServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->mapWebRoutes();
    }

    private function mapWebRoutes(): void
    {
        Route::middleware('web')
            ->group(base_path('app/Modules/Storefront/routes/web.php'));
    }
}
