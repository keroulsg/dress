<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Providers;

use App\Modules\Inspection\Application\Services\InspectionService;
use App\Modules\Inspection\Domain\Contracts\InspectionContract;
use App\Modules\Inspection\Domain\Policies\InspectionPolicy;
use App\Modules\Inspection\Infrastructure\Repositories\EloquentInspectionRepository;
use App\Modules\Inspection\Infrastructure\Repositories\InspectionRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class InspectionServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(InspectionContract::class, InspectionService::class);
        $this->app->bind(InspectionRepository::class, EloquentInspectionRepository::class);
    }

    public function boot(): void
    {
        // Registered as a Gate ability (not a Booking policy) so it does not
        // shadow BookingPolicy on the Booking model.
        Gate::define('inspect', [InspectionPolicy::class, 'inspect']);

        $this->loadMigrationsFrom(__DIR__.'/../Infrastructure/Database/Migrations');

        $webRoutes = __DIR__.'/../routes/web.php';

        if (is_file($webRoutes)) {
            $this->loadRoutesFrom($webRoutes);
        }
    }
}
