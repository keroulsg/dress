<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Observers;

use App\Modules\Administration\Domain\Contracts\AuditWriter;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;

class BookingObserver
{
    public function __construct(private readonly AuditWriter $audit) {}

    public function updated(Booking $booking): void
    {
        if (! $booking->wasChanged('status')) {
            return;
        }

        $action = $booking->status === BookingStatus::Cancelled ? 'booking.cancelled' : 'booking.status_changed';

        $this->audit->record(
            actorId: $booking->cancelled_by ?? null,
            action: $action,
            auditableType: $booking->getMorphClass(),
            auditableId: $booking->id,
            oldValues: [
                'status' => $booking->getOriginal('status'),
                'cancellation_reason' => $booking->getOriginal('cancellation_reason'),
            ],
            newValues: [
                'status' => $booking->status,
                'cancellation_reason' => $booking->cancellation_reason,
            ],
        );
    }
}
