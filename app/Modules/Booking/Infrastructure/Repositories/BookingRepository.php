<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Repositories;

/**
 * Persistence port for the booking aggregate owned by the Booking module.
 */
interface BookingRepository
{
    /**
     * @return array<string, mixed>|null
     */
    public function find(int $id): ?array;

    public function updateStatus(int $id, string $status): void;

    public function updateFitting(int $id, string $fittingDatetime): void;

    /**
     * @return list<array<string, mixed>>
     */
    public function itemsForBooking(int $bookingId): array;
}
