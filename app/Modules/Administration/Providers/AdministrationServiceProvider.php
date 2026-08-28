<?php

declare(strict_types=1);

namespace App\Modules\Administration\Providers;

use App\Modules\Administration\Application\Services\AuditLoggerService;
use App\Modules\Administration\Domain\Contracts\AuditWriter;
use App\Modules\Administration\Infrastructure\Repositories\AuditRepository;
use App\Modules\Administration\Infrastructure\Repositories\EloquentAuditRepository;
use Illuminate\Support\ServiceProvider;

class AdministrationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AuditWriter::class, AuditLoggerService::class);
        $this->app->bind(AuditRepository::class, EloquentAuditRepository::class);
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
