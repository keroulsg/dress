<?php

declare(strict_types=1);

namespace App\Modules\Media\Providers;

use App\Modules\Media\Application\Services\MediaService;
use App\Modules\Media\Domain\Contracts\MediaContract;
use App\Modules\Media\Infrastructure\Repositories\EloquentMediaRepository;
use App\Modules\Media\Infrastructure\Repositories\MediaRepository;
use Illuminate\Support\ServiceProvider;

class MediaServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(MediaContract::class, MediaService::class);
        $this->app->bind(MediaRepository::class, EloquentMediaRepository::class);
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
