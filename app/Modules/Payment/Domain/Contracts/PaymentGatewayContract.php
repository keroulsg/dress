<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Contracts;

use App\Modules\Payment\Application\DTOs\PaymentResultDTO;
use App\Modules\Payment\Application\DTOs\PaymentSessionDTO;
use App\Modules\Payment\Application\DTOs\PaymentSessionResultDTO;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Port for the payment gateway. The concrete driver (mock/stripe/myfatoorah/
 * hyperpay) is resolved by GatewayFactory; Payment never depends on a vendor.
 */
interface PaymentGatewayContract
{
    public function createPaymentSession(PaymentSessionDTO $dto): PaymentSessionResultDTO;

    public function capturePayment(string $gatewayRef, Money $amount): PaymentResultDTO;

    public function authorizeDeposit(int $bookingId, Money $amount, string $paymentMethodToken): PaymentResultDTO;

    public function captureDeposit(string $authorizationRef, Money $amount): PaymentResultDTO;

    public function releaseDeposit(string $authorizationRef): PaymentResultDTO;

    public function refundPayment(string $gatewayRef, Money $amount, string $reason): PaymentResultDTO;

    public function verifyWebhookSignature(string $payload, string $signature): bool;
}
