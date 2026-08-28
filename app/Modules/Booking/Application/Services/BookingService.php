<?php

declare(strict_types=1);

namespace App\Modules\Booking\Application\Services;

use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Domain\Enums\AvailabilityHoldReason;
use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Booking\Application\DTOs\BookingSnapshotDTO;
use App\Modules\Booking\Domain\Contracts\BookingContract;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\Events\BookingCreated;
use App\Modules\Booking\Domain\Events\BookingStatusChanged;
use App\Modules\Booking\Domain\Exceptions\BookingNotFoundException;
use App\Modules\Booking\Domain\Exceptions\InvalidBookingTransitionException;
use App\Modules\Booking\Infrastructure\Repositories\BookingRepository;
use App\Modules\Inventory\Domain\Contracts\InventoryStateManager;
use App\Modules\Notification\Application\DTOs\NotificationEnvelopeDTO;
use App\Modules\Notification\Domain\Contracts\NotificationContract;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use Closure;
use Illuminate\Support\Facades\Event;

/**
 * Booking aggregate lifecycle. All state changes flow through this service so
 * the transition map is the single source of truth for legal moves.
 */
class BookingService implements BookingContract
{
    private const TRANSITIONS = [
        BookingStatus::PendingPayment->value => [
            'confirm' => [
                'to' => BookingStatus::Confirmed,
                'actor' => 'renter',
                'effects' => ['lock_dates', 'dispatch_created', 'notify_confirmed'],
            ],
            'cancel' => [
                'to' => BookingStatus::Cancelled,
                'actor' => 'renter',
                'effects' => ['release_dates', 'notify_cancelled'],
            ],
            'expire' => [
                'to' => BookingStatus::Expired,
                'actor' => 'system',
                'effects' => ['release_dates'],
            ],
        ],
        BookingStatus::Confirmed->value => [
            'schedule_fitting' => [
                'to' => BookingStatus::FittingScheduled,
                'actor' => 'atelier',
                'effects' => [],
            ],
            'cancel' => [
                'to' => BookingStatus::Cancelled,
                'actor' => 'renter',
                'effects' => ['release_dates', 'notify_cancelled'],
            ],
        ],
        BookingStatus::FittingScheduled->value => [
            'schedule_fitting' => [
                'to' => BookingStatus::FittingScheduled,
                'actor' => 'atelier',
                'effects' => [],
            ],
            'mark_ready' => [
                'to' => BookingStatus::ReadyForDispatch,
                'actor' => 'atelier',
                'effects' => [],
            ],
            'cancel' => [
                'to' => BookingStatus::Cancelled,
                'actor' => 'renter',
                'effects' => ['release_dates', 'notify_cancelled'],
            ],
        ],
        BookingStatus::ReadyForDispatch->value => [
            'dispatch' => [
                'to' => BookingStatus::Dispatched,
                'actor' => 'atelier',
                'effects' => ['mark_rented', 'notify_dispatched'],
            ],
            'cancel' => [
                'to' => BookingStatus::Cancelled,
                'actor' => 'renter',
                'effects' => ['release_dates', 'notify_cancelled'],
            ],
        ],
        BookingStatus::Dispatched->value => [
            'confirm_receipt' => [
                'to' => BookingStatus::InCustomerPossession,
                'actor' => 'renter',
                'effects' => ['notify_received'],
            ],
        ],
        BookingStatus::InCustomerPossession->value => [
            'report_return' => [
                'to' => BookingStatus::ReturnedPendingInspection,
                'actor' => 'renter',
                'effects' => ['mark_cleaning', 'notify_returned'],
            ],
        ],
        BookingStatus::ReturnedPendingInspection->value => [
            'complete_inspection' => [
                'to' => BookingStatus::InspectionCompleted,
                'actor' => 'atelier',
                'effects' => ['quote_late_fees', 'notify_inspected'],
            ],
            'dispute' => [
                'to' => BookingStatus::Disputed,
                'actor' => 'renter',
                'effects' => ['notify_disputed'],
            ],
        ],
        BookingStatus::InspectionCompleted->value => [
            'complete' => [
                'to' => BookingStatus::Completed,
                'actor' => 'atelier',
                'effects' => ['mark_available', 'notify_completed'],
            ],
            'dispute' => [
                'to' => BookingStatus::Disputed,
                'actor' => 'renter',
                'effects' => ['notify_disputed'],
            ],
        ],
        BookingStatus::Disputed->value => [
            'resolve' => [
                'to' => BookingStatus::Completed,
                'actor' => 'admin',
                'effects' => ['mark_available', 'notify_resolved'],
            ],
            'cancel' => [
                'to' => BookingStatus::Cancelled,
                'actor' => 'admin',
                'effects' => ['release_dates'],
            ],
        ],
    ];

    public function __construct(
        private readonly BookingRepository $repository,
        private readonly AvailabilityContract $availability,
        private readonly PricingContract $pricing,
        private readonly NotificationContract $notification,
        private readonly InventoryStateManager $inventory,
    ) {}

    public function getSnapshot(int $bookingId): BookingSnapshotDTO
    {
        $data = $this->repository->find($bookingId);

        if ($data === null) {
            throw new BookingNotFoundException($bookingId);
        }

        return new BookingSnapshotDTO(
            bookingId: $bookingId,
            bookingReference: (string) ($data['booking_reference'] ?? ''),
            renterId: (int) ($data['renter_id'] ?? 0),
            atelierId: (int) ($data['atelier_id'] ?? 0),
            startDate: (string) ($data['start_date'] ?? ''),
            endDate: (string) ($data['end_date'] ?? ''),
            status: (string) ($data['status'] ?? BookingStatus::PendingPayment->value),
            items: $this->repository->itemsForBooking($bookingId),
            grandTotal: (string) ($data['grand_total'] ?? '0'),
            currency: (string) ($data['currency'] ?? 'EGP'),
        );
    }

    public function transition(int $bookingId, string $transition, int $actorId, array $context = []): BookingSnapshotDTO
    {
        $snapshot = $this->getSnapshot($bookingId);

        $transitions = self::TRANSITIONS[$snapshot->status] ?? [];

        if (! isset($transitions[$transition])) {
            throw InvalidBookingTransitionException::from($snapshot->status, $transition);
        }

        $rule = $transitions[$transition];

        $this->applyEffects($snapshot, $rule['effects'], $actorId, $context);

        $this->repository->updateStatus($bookingId, $rule['to']->value);

        Event::dispatch(new BookingStatusChanged($bookingId, $snapshot->status, $rule['to']->value));

        return $this->getSnapshot($bookingId);
    }

    public function scheduleFitting(int $bookingId, string $fittingDatetime, int $actorId): BookingSnapshotDTO
    {
        $snapshot = $this->getSnapshot($bookingId);

        if (! in_array($snapshot->status, [
            BookingStatus::Confirmed->value,
            BookingStatus::FittingScheduled->value,
        ], true)) {
            throw InvalidBookingTransitionException::from($snapshot->status, BookingStatus::FittingScheduled->value);
        }

        $this->repository->updateFitting($bookingId, $fittingDatetime);

        if ($snapshot->status !== BookingStatus::FittingScheduled->value) {
            $this->repository->updateStatus($bookingId, BookingStatus::FittingScheduled->value);

            Event::dispatch(new BookingStatusChanged($bookingId, $snapshot->status, BookingStatus::FittingScheduled->value));
        }

        return $this->getSnapshot($bookingId);
    }

    public function cancel(int $bookingId, int $actorId, string $reason): BookingSnapshotDTO
    {
        $snapshot = $this->getSnapshot($bookingId);

        if (in_array($snapshot->status, [
            BookingStatus::Cancelled->value,
            BookingStatus::Completed->value,
            BookingStatus::Expired->value,
        ], true)) {
            throw InvalidBookingTransitionException::from($snapshot->status, BookingStatus::Cancelled->value);
        }

        $this->releaseHolds($snapshot);

        $this->repository->updateStatus($bookingId, BookingStatus::Cancelled->value);

        Event::dispatch(new BookingStatusChanged($bookingId, $snapshot->status, BookingStatus::Cancelled->value));

        return $this->getSnapshot($bookingId);
    }

    private function applyEffects(BookingSnapshotDTO $snapshot, array $effects, int $actorId, array $context): void
    {
        foreach ($effects as $effect) {
            match ($effect) {
                'lock_dates' => $this->lockDates($snapshot),
                'release_dates' => $this->releaseHolds($snapshot),
                'dispatch_created' => Event::dispatch(new BookingCreated($snapshot->bookingId)),
                'mark_rented' => $this->applyToEachDress($snapshot, fn (int $dressId): mixed => $this->inventory->markRented($dressId, $actorId)),
                'mark_cleaning' => $this->applyToEachDress($snapshot, fn (int $dressId): mixed => $this->inventory->markCleaning($dressId, $actorId)),
                'mark_available' => $this->applyToEachDress($snapshot, fn (int $dressId): mixed => $this->inventory->markAvailable($dressId, $actorId)),
                'quote_late_fees' => $this->pricing->quoteLateFees(
                    (int) ($context['late_days'] ?? 0),
                    (float) ($context['late_fee_per_day'] ?? 0),
                    $snapshot->currency,
                ),
                'notify_confirmed' => $this->notifyRenter($snapshot->renterId, 'booking_confirmed', 'Booking confirmed', sprintf('Your dress booking #%s has been confirmed.', $snapshot->bookingReference)),
                'notify_cancelled' => $this->notifyRenter($snapshot->renterId, 'booking_cancelled', 'Booking cancelled', sprintf('Your dress booking #%s was cancelled.', $snapshot->bookingReference)),
                'notify_dispatched' => $this->notifyRenter($snapshot->renterId, 'booking_dispatched', 'Booking dispatched', sprintf('Your dress booking #%s is on its way.', $snapshot->bookingReference)),
                'notify_received' => $this->notifyRenter($snapshot->renterId, 'booking_received', 'Booking received', sprintf('Enjoy your dress! Booking #%s.', $snapshot->bookingReference)),
                'notify_returned' => $this->notifyRenter($snapshot->renterId, 'booking_returned', 'Return received', sprintf('Your return for booking #%s is being inspected.', $snapshot->bookingReference)),
                'notify_inspected' => $this->notifyRenter($snapshot->renterId, 'inspection_completed', 'Inspection completed', sprintf('The inspection for booking #%s is complete.', $snapshot->bookingReference)),
                'notify_disputed' => $this->notifyRenter($snapshot->renterId, 'booking_disputed', 'Booking disputed', sprintf('A dispute was opened for booking #%s.', $snapshot->bookingReference)),
                'notify_completed' => $this->notifyRenter($snapshot->renterId, 'booking_completed', 'Booking completed', sprintf('Booking #%s is complete. Thank you!', $snapshot->bookingReference)),
                'notify_resolved' => $this->notifyRenter($snapshot->renterId, 'dispute_resolved', 'Dispute resolved', sprintf('The dispute on booking #%s was resolved.', $snapshot->bookingReference)),
                default => null,
            };
        }
    }

    private function lockDates(BookingSnapshotDTO $snapshot): void
    {
        $range = DateRange::between($snapshot->startDate, $snapshot->endDate);

        $this->applyToEachDress($snapshot, function (int $dressId) use ($snapshot, $range): void {
            $this->availability->lockDatesForBooking(
                $dressId,
                $range,
                AvailabilityHoldReason::ConfirmedBooking->value,
                $snapshot->bookingId,
            );
        });
    }

    private function releaseHolds(BookingSnapshotDTO $snapshot): void
    {
        $this->availability->releaseDatesForBooking(AvailabilityHoldReason::ConfirmedBooking->value, $snapshot->bookingId);
        $this->availability->releaseDatesForBooking(AvailabilityHoldReason::Fitting->value, $snapshot->bookingId);
    }

    private function applyToEachDress(BookingSnapshotDTO $snapshot, Closure $callback): void
    {
        foreach ($snapshot->items as $item) {
            if (isset($item['dress_id'])) {
                $callback((int) $item['dress_id']);
            }
        }
    }

    private function notifyRenter(int $renterId, string $type, string $title, string $body): void
    {
        $this->notification->send(new NotificationEnvelopeDTO(
            recipientId: $renterId,
            type: $type,
            title: $title,
            body: $body,
        ));
    }
}
