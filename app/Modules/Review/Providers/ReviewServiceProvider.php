<?php

declare(strict_types=1);

namespace App\Modules\Review\Providers;

use App\Modules\Review\Application\Services\ReviewService;
use App\Modules\Review\Domain\Contracts\ReviewContract;
use App\Modules\Review\Infrastructure\Repositories\EloquentReviewRepository;
use App\Modules\Review\Infrastructure\Repositories\ReviewRepository;
use Illuminate\Support\ServiceProvider;

class ReviewServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ReviewContract::class, ReviewService::class);
        $this->app->bind(ReviewRepository::class, EloquentReviewRepository::class);
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
