<?php

declare(strict_types=1);

namespace App\Modules\Payment\Infrastructure\Gateways;

use App\Modules\Payment\Domain\Contracts\PaymentGatewayContract;
use App\Modules\Payment\Domain\Exceptions\PaymentFailedException;
use Illuminate\Contracts\Foundation\Application;

/**
 * Resolves the active gateway driver from config/payment.php. Local and testing
 * environments default to the deterministic mock. Production fails closed until
 * a real driver is configured.
 */
class GatewayFactory
{
    public function __construct(private readonly Application $app) {}

    public function resolve(): PaymentGatewayContract
    {
        $driver = (string) config('payment.gateway', 'mock');
        $environment = $this->app->environment();

        if ($driver === 'mock' || in_array($environment, ['local', 'testing'], true)) {
            return $this->app->make(MockPaymentGateway::class);
        }

        throw PaymentFailedException::gatewayError(
            'No payment gateway driver is configured for the production environment.',
        );
    }
}
