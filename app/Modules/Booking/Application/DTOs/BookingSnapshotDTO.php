<?php

declare(strict_types=1);

namespace App\Modules\Booking\Application\DTOs;

/**
 * Immutable snapshot of a booking aggregate.
 */
final readonly class BookingSnapshotDTO
{
    /**
     * @param  list<array<string, mixed>>  $items
     */
    public function __construct(
        public int $bookingId,
        public string $bookingReference,
        public int $renterId,
        public int $atelierId,
        public string $startDate,
        public string $endDate,
        public string $status,
        public array $items,
        public string $grandTotal,
        public string $currency,
    ) {}
}
