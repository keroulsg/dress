<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Contracts;

use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use Carbon\CarbonInterface;

/**
 * Public orchestration contract for the Booking module.
 *
 * Booking creation is atomic (dates locked, server-side pricing, items
 * persisted). All lifecycle changes flow through the state machine; direct
 * status mutation outside this contract is forbidden.
 */
interface BookingOrchestratorContract
{
    public function createBooking(CreateBookingDTO $dto): Booking;

    /**
     * @param  array{actor_id?: int|null, reason?: string|null}  $context
     */
    public function transitionStatus(int $bookingId, BookingStatus $targetStatus, array $context = []): Booking;

    public function scheduleFitting(int $bookingId, CarbonInterface $fittingDateTime, array $context = []): Booking;

    public function cancelBooking(int $bookingId, int $actorUserId, string $reason): Booking;

    /**
     * Transitions stale pending-payment bookings to expired and releases their
     * availability holds. Returns the number of bookings expired.
     */
    public function expirePendingBookings(int $timeoutMinutes = 30): int;
}
