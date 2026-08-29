<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Immutable payment session request for the gateway.
 */
final readonly class PaymentSessionDTO
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public int $bookingId,
        public int $userId,
        public int $atelierId,
        public Money $amount,
        public string $paymentMethod,
        public string $returnUrl,
        public string $idempotencyKey,
        public array $metadata = [],
    ) {}
}
