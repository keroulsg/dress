<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Contracts;

use App\Modules\Payment\Application\DTOs\PaymentInitiationDTO;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Port for the payment gateway. The concrete provider is a Phase 8 decision;
 * this interface keeps Payment independent of any vendor.
 */
interface PaymentGateway
{
    public function authorize(PaymentInitiationDTO $dto): array;

    public function capture(string $gatewayReference, Money $amount): array;

    public function void(string $gatewayReference): array;

    public function refund(string $gatewayReference, Money $amount): array;

    public function verifyWebhookSignature(array $payload, string $signature): bool;
}
