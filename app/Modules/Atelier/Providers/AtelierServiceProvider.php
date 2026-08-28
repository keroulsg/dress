<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Providers;

use App\Modules\Atelier\Application\Services\AtelierService;
use App\Modules\Atelier\Domain\Contracts\AtelierAccess;
use App\Modules\Atelier\Domain\Contracts\AtelierReader;
use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Domain\Policies\AtelierPolicy;
use App\Modules\Atelier\Infrastructure\Observers\AtelierObserver;
use App\Modules\Atelier\Infrastructure\Repositories\AtelierRepository;
use App\Modules\Atelier\Infrastructure\Repositories\EloquentAtelierRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AtelierServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AtelierReader::class, AtelierService::class);
        $this->app->bind(AtelierAccess::class, AtelierService::class);
        $this->app->bind(AtelierRepository::class, EloquentAtelierRepository::class);
    }

    public function boot(): void
    {
        Gate::policy(Atelier::class, AtelierPolicy::class);
        Atelier::observe(AtelierObserver::class);

        $this->loadMigrationsFrom(__DIR__.'/../Infrastructure/Database/Migrations');

        $webRoutes = __DIR__.'/../routes/web.php';

        if (is_file($webRoutes)) {
            $this->loadRoutesFrom($webRoutes);
        }
    }
}
