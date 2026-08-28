<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Enums;

/**
 * Booking lifecycle states. Only the Booking state machine may move a booking
 * between these states.
 */
enum BookingStatus: string
{
    case PendingPayment = 'pending_payment';
    case Confirmed = 'confirmed';
    case FittingScheduled = 'fitting_scheduled';
    case ReadyForDispatch = 'ready_for_dispatch';
    case Dispatched = 'dispatched';
    case InCustomerPossession = 'in_customer_possession';
    case ReturnedPendingInspection = 'returned_pending_inspection';
    case InspectionCompleted = 'inspection_completed';
    case Completed = 'completed';
    case Disputed = 'disputed';
    case Cancelled = 'cancelled';
    case Expired = 'expired';
}
