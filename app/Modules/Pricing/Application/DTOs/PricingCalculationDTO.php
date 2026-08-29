<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\DTOs;

use Carbon\CarbonInterface;

/**
 * Immutable input for a server-side pricing quote. Client prices are never
 * accepted; the backend resolves the authoritative dress rates.
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
        public float|int|string $securityDeposit = 0,
        public ?float $taxRate = null,
        public ?string $couponCode = null,
        public bool $includeDelivery = false,
        public ?string $deliveryCity = null,
        public string $currency = 'EGP',
    ) {}
}
