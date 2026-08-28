<?php

declare(strict_types=1);

namespace App\Modules\Payment\Providers;

use App\Modules\Payment\Application\Services\PaymentService;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Contracts\PaymentGateway;
use App\Modules\Payment\Infrastructure\Gateway\UnconfiguredGatewayAdapter;
use App\Modules\Payment\Infrastructure\Repositories\EloquentPaymentRepository;
use App\Modules\Payment\Infrastructure\Repositories\PaymentRepository;
use Illuminate\Support\ServiceProvider;

class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentContract::class, PaymentService::class);
        $this->app->bind(PaymentRepository::class, EloquentPaymentRepository::class);

        // Fail-closed default: a concrete gateway adapter is a Phase 8 decision.
        $this->app->bind(PaymentGateway::class, UnconfiguredGatewayAdapter::class);
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
