<?php

declare(strict_types=1);

namespace App\Modules\Payment\Infrastructure\Gateways;

use App\Modules\Payment\Application\DTOs\PaymentResultDTO;
use App\Modules\Payment\Application\DTOs\PaymentSessionDTO;
use App\Modules\Payment\Application\DTOs\PaymentSessionResultDTO;
use App\Modules\Payment\Domain\Contracts\PaymentGatewayContract;
use App\Modules\Payment\Domain\Enums\TransactionStatus;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Support\Str;

/**
 * Deterministic sandbox gateway for local/testing. Scenarios are selected by
 * the payment method token:
 *   mock_card_success — approved; mock_card_3ds — requires_action redirect;
 *   mock_card_declined — declined. Webhook signatures are HMAC-signed with the
 *   application key.
 */
class MockPaymentGateway implements PaymentGatewayContract
{
    public function createPaymentSession(PaymentSessionDTO $dto): PaymentSessionResultDTO
    {
        $reference = 'MOCK-'.strtoupper(Str::uuid()->toString());

        return match ($dto->paymentMethod) {
            'mock_card_declined' => new PaymentSessionResultDTO(
                transactionId: 0,
                status: 'declined',
                message: 'Your card was declined by the issuing bank.',
            ),
            'mock_card_3ds' => new PaymentSessionResultDTO(
                transactionId: 0,
                status: 'requires_action',
                redirectUrl: $dto->returnUrl,
                gatewayReference: $reference,
            ),
            default => new PaymentSessionResultDTO(
                transactionId: 0,
                status: 'approved',
                gatewayReference: $reference,
            ),
        };
    }

    public function capturePayment(string $gatewayRef, Money $amount): PaymentResultDTO
    {
        return $this->result(TransactionStatus::Captured->value, $amount, $gatewayRef);
    }

    public function authorizeDeposit(int $bookingId, Money $amount, string $paymentMethodToken): PaymentResultDTO
    {
        return $this->result(TransactionStatus::Authorized->value, $amount, 'DEP-AUTH-'.strtoupper(Str::random(8)));
    }

    public function captureDeposit(string $authorizationRef, Money $amount): PaymentResultDTO
    {
        return $this->result(TransactionStatus::Captured->value, $amount, $authorizationRef);
    }

    public function releaseDeposit(string $authorizationRef): PaymentResultDTO
    {
        return $this->result(TransactionStatus::Voided->value, Money::zero('EGP'), $authorizationRef);
    }

    public function refundPayment(string $gatewayRef, Money $amount, string $reason): PaymentResultDTO
    {
        return $this->result(TransactionStatus::Refunded->value, $amount, $gatewayRef);
    }

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $expected = hash_hmac('sha256', $payload, (string) config('app.key'));

        return hash_equals($expected, $signature);
    }

    private function result(string $status, Money $amount, ?string $reference): PaymentResultDTO
    {
        return new PaymentResultDTO(
            transactionId: 0,
            status: $status,
            amount: $amount,
            gatewayReference: $reference,
        );
    }
}
