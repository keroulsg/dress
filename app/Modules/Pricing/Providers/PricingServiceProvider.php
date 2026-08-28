<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Providers;

use App\Modules\Pricing\Application\Services\PricingService;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use Illuminate\Support\ServiceProvider;

class PricingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PricingContract::class, function (): PricingService {
            return new PricingService(
                currency: (string) config('pricing.currency', 'EGP'),
                taxRate: (float) config('pricing.tax_rate', 0.14),
            );
        });
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Infrastructure/Database/Migrations');

        $webRoutes = __DIR__.'/../routes/web.php';

        if (is_file($webRoutes)) {
            $this->loadRoutesFrom($webRoutes);
        }
    }
}
