<?php

declare(strict_types=1);

namespace App\Modules\Booking\Providers;

use App\Modules\Booking\Application\Services\BookingService;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Policies\BookingPolicy;
use App\Modules\Booking\Infrastructure\Console\Commands\ExpirePendingBookings;
use App\Modules\Booking\Infrastructure\Observers\BookingObserver;
use App\Modules\Booking\Infrastructure\Repositories\BookingRepository;
use App\Modules\Booking\Infrastructure\Repositories\EloquentBookingRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class BookingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(BookingOrchestratorContract::class, BookingService::class);
        $this->app->bind(BookingRepository::class, EloquentBookingRepository::class);
    }

    public function boot(): void
    {
        Gate::policy(Booking::class, BookingPolicy::class);
        Booking::observe(BookingObserver::class);

        $this->commands([ExpirePendingBookings::class]);

        $this->loadMigrationsFrom(__DIR__.'/../Infrastructure/Database/Migrations');

        $webRoutes = __DIR__.'/../routes/web.php';

        if (is_file($webRoutes)) {
            $this->loadRoutesFrom($webRoutes);
        }
    }
}
