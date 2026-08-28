<?php

declare(strict_types=1);

namespace App\Modules\Notification\Providers;

use App\Modules\Notification\Application\Services\NotificationService;
use App\Modules\Notification\Domain\Contracts\NotificationContract;
use App\Modules\Notification\Infrastructure\Repositories\EloquentNotificationRepository;
use App\Modules\Notification\Infrastructure\Repositories\NotificationRepository;
use Illuminate\Support\ServiceProvider;

class NotificationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(NotificationContract::class, NotificationService::class);
        $this->app->bind(NotificationRepository::class, EloquentNotificationRepository::class);
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
