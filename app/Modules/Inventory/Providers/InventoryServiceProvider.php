<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Providers;

use App\Modules\Inventory\Application\Services\InventoryService;
use App\Modules\Inventory\Domain\Contracts\InventoryStateContract;
use App\Modules\Inventory\Domain\Contracts\InventoryStateManager;
use App\Modules\Inventory\Infrastructure\Repositories\EloquentInventoryRepository;
use App\Modules\Inventory\Infrastructure\Repositories\InventoryRepository;
use Illuminate\Support\ServiceProvider;

class InventoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(InventoryStateContract::class, InventoryService::class);
        $this->app->bind(InventoryStateManager::class, InventoryService::class);
        $this->app->bind(InventoryRepository::class, EloquentInventoryRepository::class);
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
