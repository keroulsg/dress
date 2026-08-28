<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Providers;

use App\Modules\Catalog\Application\Services\CatalogService;
use App\Modules\Catalog\Domain\Contracts\CatalogReader;
use App\Modules\Catalog\Domain\Contracts\DressManagementContract;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Policies\DressPolicy;
use App\Modules\Catalog\Infrastructure\Repositories\CatalogRepository;
use App\Modules\Catalog\Infrastructure\Repositories\EloquentCatalogRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class CatalogServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CatalogReader::class, CatalogService::class);
        $this->app->bind(DressManagementContract::class, CatalogService::class);
        $this->app->bind(CatalogRepository::class, EloquentCatalogRepository::class);
    }

    public function boot(): void
    {
        Gate::policy(Dress::class, DressPolicy::class);

        $this->loadMigrationsFrom(__DIR__.'/../Infrastructure/Database/Migrations');

        $webRoutes = __DIR__.'/../routes/web.php';

        if (is_file($webRoutes)) {
            $this->loadRoutesFrom($webRoutes);
        }
    }
}
