<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Immutable payment initiation request.
 */
final readonly class PaymentInitiationDTO
{
    public function __construct(
        public int $bookingId,
        public int $userId,
        public int $atelierId,
        public Money $amount,
        public string $type,
        public string $paymentMethod,
        public string $idempotencyKey,
        public array $metadata = [],
    ) {}
}
