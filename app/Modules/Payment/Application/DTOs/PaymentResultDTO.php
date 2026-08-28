<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Immutable result of a payment operation.
 */
final readonly class PaymentResultDTO
{
    public function __construct(
        public int $transactionId,
        public string $status,
        public Money $amount,
        public ?string $gatewayReference = null,
        public bool $isReplay = false,
    ) {}
}
