<?php

declare(strict_types=1);

namespace App\Modules\Identity\Providers;

use App\Modules\Identity\Application\Services\IdentityService;
use App\Modules\Identity\Domain\Contracts\IdentityReader;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Observers\UserObserver;
use App\Modules\Identity\Infrastructure\Repositories\EloquentIdentityRepository;
use App\Modules\Identity\Infrastructure\Repositories\IdentityRepository;
use Illuminate\Support\ServiceProvider;

class IdentityServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(IdentityReader::class, IdentityService::class);
        $this->app->bind(IdentityRepository::class, EloquentIdentityRepository::class);
    }

    public function boot(): void
    {
        User::observe(UserObserver::class);

        $this->loadMigrationsFrom(__DIR__.'/../Infrastructure/Database/Migrations');

        $webRoutes = __DIR__.'/../routes/web.php';

        if (is_file($webRoutes)) {
            $this->loadRoutesFrom($webRoutes);
        }
    }
}
