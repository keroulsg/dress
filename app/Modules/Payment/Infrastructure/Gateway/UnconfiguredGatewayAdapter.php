<?php

declare(strict_types=1);

namespace App\Modules\Payment\Infrastructure\Gateway;

use App\Modules\Payment\Application\DTOs\PaymentInitiationDTO;
use App\Modules\Payment\Domain\Contracts\PaymentGateway;
use App\Modules\Payment\Domain\Exceptions\PaymentFailedException;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Fail-closed default adapter. Every call throws until a concrete gateway is
 * configured in Phase 8, so no payment can silently succeed unconfigured.
 */
class UnconfiguredGatewayAdapter implements PaymentGateway
{
    public function authorize(PaymentInitiationDTO $dto): array
    {
        throw PaymentFailedException::gatewayError('No payment gateway is configured.');
    }

    public function capture(string $gatewayReference, Money $amount): array
    {
        throw PaymentFailedException::gatewayError('No payment gateway is configured.');
    }

    public function void(string $gatewayReference): array
    {
        throw PaymentFailedException::gatewayError('No payment gateway is configured.');
    }

    public function refund(string $gatewayReference, Money $amount): array
    {
        throw PaymentFailedException::gatewayError('No payment gateway is configured.');
    }

    public function verifyWebhookSignature(array $payload, string $signature): bool
    {
        return false;
    }
}
