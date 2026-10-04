<?php

namespace App\Modules\Dispute\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

class DisputeResolutionDTO
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public readonly string $verdict,
        public readonly ?Money $refundAmountOverride,
        public readonly string $resolutionNotes,
    ) {}
}
