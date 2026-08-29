<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Contracts;

use App\Modules\Payment\Application\DTOs\PaymentSessionResultDTO;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Public service contract for the Payment module.
 *
 * Owns the two-step authorize/capture flow, deposit hold/release, refunds, and
 * webhook reconciliation. Every financial mutation is idempotent.
 */
interface PaymentContract
{
    public function initiateBookingPayment(int $bookingId, string $paymentMethod, string $returnUrl, string $idempotencyKey): PaymentSessionResultDTO;

    public function handlePaymentSuccess(string $gatewayReference, string $idempotencyKey, array $payload = []): Transaction;

    public function handlePaymentFailure(string $gatewayReference, string $errorMessage): void;

    public function processDepositSettlement(int $bookingId, Money $depositHeld, Money $deductionAmount, Money $refundAmount, string $idempotencyKey): void;

    public function processCustomerRefund(int $bookingId, Money $amount, string $reason, string $idempotencyKey): Transaction;
}
