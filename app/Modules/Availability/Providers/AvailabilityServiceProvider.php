<?php

declare(strict_types=1);

namespace App\Modules\Availability\Providers;

use App\Modules\Availability\Application\Services\AvailabilityService;
use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Infrastructure\Repositories\AvailabilityRepository;
use App\Modules\Availability\Infrastructure\Repositories\EloquentAvailabilityRepository;
use Illuminate\Support\ServiceProvider;

class AvailabilityServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AvailabilityContract::class, AvailabilityService::class);
        $this->app->bind(AvailabilityRepository::class, EloquentAvailabilityRepository::class);
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
