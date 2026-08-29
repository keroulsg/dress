<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\DTOs;

/**
 * Result of creating a payment session.
 */
final readonly class PaymentSessionResultDTO
{
    public function __construct(
        public int $transactionId,
        public string $status,
        public ?string $redirectUrl = null,
        public ?string $gatewayReference = null,
        public ?string $message = null,
        public bool $isReplay = false,
    ) {}
}
