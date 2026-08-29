<?php

declare(strict_types=1);

namespace App\Modules\Payment\Providers;

use App\Modules\Payment\Application\Services\PaymentService;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Contracts\PaymentGatewayContract;
use App\Modules\Payment\Infrastructure\Gateways\GatewayFactory;
use App\Modules\Payment\Infrastructure\Repositories\EloquentPaymentRepository;
use App\Modules\Payment\Infrastructure\Repositories\PaymentRepository;
use Illuminate\Support\ServiceProvider;

class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentContract::class, PaymentService::class);
        $this->app->bind(PaymentRepository::class, EloquentPaymentRepository::class);

        $this->app->bind(PaymentGatewayContract::class, function ($app): PaymentGatewayContract {
            return $app->make(GatewayFactory::class)->resolve();
        });
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
