<?php

declare(strict_types=1);

namespace App\Modules\Finance\Providers;

use App\Modules\Finance\Application\Services\DoubleEntryLedgerService;
use App\Modules\Finance\Application\Services\SettlementService;
use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Finance\Domain\Contracts\SettlementContract;
use App\Modules\Finance\Infrastructure\Listeners\PostBookingCaptureLedger;
use App\Modules\Finance\Infrastructure\Listeners\PostCustomerRefundLedger;
use App\Modules\Finance\Infrastructure\Listeners\PostDepositSettlementLedger;
use App\Modules\Finance\Infrastructure\Repositories\EloquentLedgerRepository;
use App\Modules\Finance\Infrastructure\Repositories\LedgerRepository;
use App\Modules\Payment\Domain\Events\DepositSettled;
use App\Modules\Payment\Domain\Events\PaymentCaptured;
use App\Modules\Payment\Domain\Events\PaymentRefunded;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class FinanceServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(LedgerContract::class, DoubleEntryLedgerService::class);
        $this->app->bind(SettlementContract::class, SettlementService::class);
        $this->app->bind(LedgerRepository::class, EloquentLedgerRepository::class);
    }

    public function boot(): void
    {
        Event::listen(PaymentCaptured::class, PostBookingCaptureLedger::class);
        Event::listen(PaymentRefunded::class, PostCustomerRefundLedger::class);
        Event::listen(DepositSettled::class, PostDepositSettlementLedger::class);

        $this->loadMigrationsFrom(__DIR__.'/../Infrastructure/Database/Migrations');

        $webRoutes = __DIR__.'/../routes/web.php';

        if (is_file($webRoutes)) {
            $this->loadRoutesFrom($webRoutes);
        }
    }
}
