<?php

declare(strict_types=1);

namespace App\Modules\Availability\Domain\Contracts;

use App\Modules\Availability\Domain\Entities\DressAvailability;
use App\Modules\Availability\Domain\ValueObjects\DateRange;

/**
 * Public contract for the Availability module.
 *
 * Owns date conflict detection, operational occupied periods, buffer periods,
 * and calendar availability. The turnaround buffer is materialized as a
 * trailing cleaning hold, so double booking is mathematically impossible.
 */
interface AvailabilityContract
{
    /**
     * Whether the dress is available for the inclusive range, expanding the
     * requested end by the dress's turnaround buffer (per the overlap
     * invariant). Optionally ignores the holds of a given reference.
     */
    public function checkRangeAvailability(int $dressId, DateRange $range, ?int $excludeReferenceId = null): bool;

    /**
     * Atomically locks the dress, verifies no overlapping hold exists, and
     * persists the booking hold plus its trailing cleaning buffer hold.
     * Throws DressUnavailableException on any overlap.
     */
    public function lockDatesForBooking(int $dressId, DateRange $range, string $referenceType, int $referenceId, string $reason = 'confirmed_booking'): DressAvailability;

    /**
     * Releases every hold belonging to a reference. Returns whether any rows
     * were removed.
     */
    public function releaseDatesForBooking(string $referenceType, int $referenceId): bool;

    public function getBufferDays(int $dressId): int;

    /**
     * Inserts an atelier/operational block (maintenance, manual block, etc.)
     * without a booking reference.
     */
    public function createOperationalBlock(int $dressId, DateRange $range, string $reason, ?string $notes = null): DressAvailability;

    /**
     * Builds the per-day availability status map for a month.
     *
     * @return array{dress_id: int, month: string, buffer_days: int, days: array<string, array{status: string, type?: string}>}
     */
    public function getMonthAvailabilityMap(int $dressId, int $year, int $month): array;
}
