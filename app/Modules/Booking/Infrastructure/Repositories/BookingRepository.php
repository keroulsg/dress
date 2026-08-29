<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Repositories;

use App\Modules\Booking\Domain\Entities\Booking;
use Carbon\CarbonInterface;

/**
 * Persistence port for the booking aggregate owned by the Booking module.
 */
interface BookingRepository
{
    public function find(int $id): ?Booking;

    public function findByClientToken(string $clientToken): ?Booking;

    public function referenceExists(string $bookingReference): bool;

    public function createBooking(array $data): Booking;

    public function createItem(int $bookingId, array $data): void;

    public function save(Booking $booking): void;

    public function updateStatus(int $id, string $status): void;

    public function updateFitting(int $id, string $fittingDatetime): void;

    /**
     * @return list<array<string, mixed>>
     */
    public function itemsForBooking(int $bookingId): array;

    /**
     * @return list<Booking>
     */
    public function pendingExpired(CarbonInterface $threshold): array;
}
