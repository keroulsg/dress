<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Providers;

use App\Modules\Dispute\Application\Services\DisputeService;
use App\Modules\Dispute\Domain\Contracts\DisputeContract;
use App\Modules\Dispute\Infrastructure\Repositories\DisputeRepository;
use App\Modules\Dispute\Infrastructure\Repositories\EloquentDisputeRepository;
use Illuminate\Support\ServiceProvider;

class DisputeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(DisputeContract::class, DisputeService::class);
        $this->app->bind(DisputeRepository::class, EloquentDisputeRepository::class);
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
