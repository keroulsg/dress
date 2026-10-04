<?php

declare(strict_types=1);

namespace App\Modules\Booking\Application\DTOs;

use Carbon\CarbonInterface;

/**
 * Immutable input for creating a booking (atomic checkout).
 */
final readonly class CreateBookingDTO
{
    public function __construct(
        public int $renterId,
        public int $atelierId,
        public int $dressId,
        public ?int $dressSizeId,
        public ?CarbonInterface $startDate = null,
        public ?CarbonInterface $endDate = null,
        public ?CarbonInterface $fittingDatetime = null,
        public ?string $deliveryAddress = null,
        public ?string $clientToken = null,
        public ?string $couponCode = null,
        public bool $isDailyBilling = true,
        public string $orderType = 'rental',
    ) {}
}
