<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Providers;

use App\Modules\Catalog\Domain\Contracts\CatalogReader;
use App\Modules\Pricing\Application\Services\PricingService;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use App\Modules\Pricing\Infrastructure\Repositories\CouponRepository;
use App\Modules\Pricing\Infrastructure\Repositories\EloquentCouponRepository;
use Illuminate\Support\ServiceProvider;

class PricingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CouponRepository::class, EloquentCouponRepository::class);

        $this->app->singleton(PricingContract::class, function ($app): PricingService {
            return new PricingService(
                catalog: $app->make(CatalogReader::class),
                coupons: $app->make(CouponRepository::class),
                baseCurrency: (string) config('pricing.currency', 'EGP'),
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
