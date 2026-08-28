<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Contracts;

use App\Modules\Payment\Application\DTOs\PaymentInitiationDTO;
use App\Modules\Payment\Application\DTOs\PaymentResultDTO;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Public contract for the Payment module.
 *
 * Owns the payment gateway lifecycle: authorization, capture, void, refund,
 * partial refund, deposit hold/release/capture, and webhook reconciliation.
 * Every operation is idempotent via a unique idempotency key.
 */
interface PaymentContract
{
    public function authorize(PaymentInitiationDTO $dto): PaymentResultDTO;

    public function capture(int $transactionId, string $idempotencyKey): PaymentResultDTO;

    public function void(int $transactionId, string $idempotencyKey): PaymentResultDTO;

    public function refund(int $transactionId, Money $amount, string $idempotencyKey): PaymentResultDTO;

    public function holdDeposit(int $bookingId, Money $amount, string $idempotencyKey): PaymentResultDTO;

    public function releaseDeposit(int $transactionId, Money $amount, string $idempotencyKey): PaymentResultDTO;

    /**
     * Processes an authenticated gateway webhook. Returns true when the event
     * was applied, false when it was a duplicate replay.
     */
    public function processWebhook(array $payload, string $signature): bool;
}
