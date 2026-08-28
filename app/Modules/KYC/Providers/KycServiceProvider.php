<?php

declare(strict_types=1);

namespace App\Modules\KYC\Providers;

use App\Modules\KYC\Application\Services\KYCService;
use App\Modules\KYC\Domain\Contracts\KycContract;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\KYC\Domain\Policies\KycPolicy;
use App\Modules\KYC\Infrastructure\Observers\KycVerificationObserver;
use App\Modules\KYC\Infrastructure\Repositories\EloquentKycRepository;
use App\Modules\KYC\Infrastructure\Repositories\KycRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class KycServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(KycContract::class, KYCService::class);
        $this->app->bind(KycRepository::class, EloquentKycRepository::class);
    }

    public function boot(): void
    {
        Gate::policy(KycVerification::class, KycPolicy::class);
        KycVerification::observe(KycVerificationObserver::class);

        $this->loadMigrationsFrom(__DIR__.'/../Infrastructure/Database/Migrations');

        $webRoutes = __DIR__.'/../routes/web.php';

        if (is_file($webRoutes)) {
            $this->loadRoutesFrom($webRoutes);
        }
    }
}
