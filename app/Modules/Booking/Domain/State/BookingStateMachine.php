<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\State;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\Exceptions\InvalidBookingTransitionException;

/**
 * Finite State Machine governing the booking lifecycle.
 *
 * A status may only change through this machine; direct status assignment on
 * the model is forbidden. Each transition declares its permitted actor class
 * and required side effects.
 */
final class BookingStateMachine
{
    /**
     * @var array<string, array<string, array{actor: string, effects: list<string>}>>
     */
    private const TRANSITIONS = [
        BookingStatus::PendingPayment->value => [
            BookingStatus::Confirmed->value => ['actor' => 'system', 'effects' => []],
            BookingStatus::Expired->value => ['actor' => 'system', 'effects' => ['release_dates', 'notify_expired']],
            BookingStatus::Cancelled->value => ['actor' => 'renter', 'effects' => ['release_dates', 'notify_cancelled']],
        ],
        BookingStatus::Confirmed->value => [
            BookingStatus::FittingScheduled->value => ['actor' => 'any', 'effects' => []],
            BookingStatus::ReadyForDispatch->value => ['actor' => 'atelier', 'effects' => []],
            BookingStatus::Cancelled->value => ['actor' => 'any', 'effects' => ['release_dates', 'notify_cancelled']],
        ],
        BookingStatus::FittingScheduled->value => [
            BookingStatus::ReadyForDispatch->value => ['actor' => 'atelier', 'effects' => []],
            BookingStatus::Cancelled->value => ['actor' => 'any', 'effects' => ['release_dates', 'notify_cancelled']],
        ],
        BookingStatus::ReadyForDispatch->value => [
            BookingStatus::Dispatched->value => ['actor' => 'atelier', 'effects' => ['mark_rented', 'mark_dispatched_at', 'notify_dispatched']],
        ],
        BookingStatus::Dispatched->value => [
            BookingStatus::InCustomerPossession->value => ['actor' => 'renter', 'effects' => ['mark_received_at', 'notify_received']],
        ],
        BookingStatus::InCustomerPossession->value => [
            BookingStatus::ReturnedPendingInspection->value => ['actor' => 'atelier', 'effects' => ['mark_cleaning', 'mark_returned_at', 'notify_returned']],
        ],
        BookingStatus::ReturnedPendingInspection->value => [
            BookingStatus::InspectionCompleted->value => ['actor' => 'system', 'effects' => ['notify_inspected']],
        ],
        BookingStatus::InspectionCompleted->value => [
            BookingStatus::Completed->value => ['actor' => 'system', 'effects' => ['mark_available', 'notify_completed']],
            BookingStatus::Disputed->value => ['actor' => 'any', 'effects' => ['notify_disputed']],
        ],
        BookingStatus::Disputed->value => [
            BookingStatus::Completed->value => ['actor' => 'system', 'effects' => ['mark_available', 'notify_resolved']],
        ],
    ];

    public function canTransition(BookingStatus $from, BookingStatus $to): bool
    {
        return isset(self::TRANSITIONS[$from->value][$to->value]);
    }

    public function assertTransition(BookingStatus $from, BookingStatus $to): void
    {
        if (! $this->canTransition($from, $to)) {
            throw InvalidBookingTransitionException::from($from->value, $to->value);
        }
    }

    public function actorFor(BookingStatus $from, BookingStatus $to): string
    {
        return self::TRANSITIONS[$from->value][$to->value]['actor'] ?? 'system';
    }

    /**
     * @return list<string>
     */
    public function effectsFor(BookingStatus $from, BookingStatus $to): array
    {
        return self::TRANSITIONS[$from->value][$to->value]['effects'] ?? [];
    }

    /**
     * Applies a legal status transition to the booking. This is the only place
     * the status attribute may change.
     */
    public function apply(Booking $booking, BookingStatus $to): void
    {
        $this->assertTransition($booking->status, $to);
        $booking->status = $to;
    }
}
