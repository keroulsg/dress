<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\DTOs;

use Carbon\CarbonInterface;

/**
 * Immutable input for a server-side pricing quote.
 */
final readonly class PricingCalculationDTO
{
    /**
     * @param  list<array{dress_id: int, daily_rate: float|int|string}>  $items
     */
    public function __construct(
        public int $renterId,
        public int $atelierId,
        public array $items,
        public CarbonInterface $startDate,
        public CarbonInterface $endDate,
        public int $rentalDays,
        public float|int|string $cleaningFee = 0,
        public float|int|string $taxRate = 0,
        public float|int|string $discountAmount = 0,
        public float|int|string $securityDeposit = 0,
        public string $currency = 'EGP',
    ) {}
}
