<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Contracts;

use App\Modules\Booking\Application\DTOs\BookingSnapshotDTO;

/**
 * Public contract for the Booking module.
 *
 * Owns the booking aggregate, its items, the lifecycle state machine, fitting,
 * and cancellation. Transitions happen only through this contract.
 */
interface BookingContract
{
    public function getSnapshot(int $bookingId): BookingSnapshotDTO;

    /**
     * Executes a named transition on the booking state machine.
     */
    public function transition(int $bookingId, string $transition, int $actorId, array $context = []): BookingSnapshotDTO;

    public function scheduleFitting(int $bookingId, string $fittingDatetime, int $actorId): BookingSnapshotDTO;

    public function cancel(int $bookingId, int $actorId, string $reason): BookingSnapshotDTO;
}
