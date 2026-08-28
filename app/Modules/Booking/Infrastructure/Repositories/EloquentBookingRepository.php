<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Repositories;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Entities\BookingItem;

class EloquentBookingRepository implements BookingRepository
{
    public function __construct(
        private readonly Booking $booking,
        private readonly BookingItem $item,
    ) {}

    public function find(int $id): ?array
    {
        $booking = $this->booking->newQuery()->find($id);

        return $booking?->toArray();
    }

    public function updateStatus(int $id, string $status): void
    {
        $this->booking
            ->newQuery()
            ->whereKey($id)
            ->update(['status' => $status]);
    }

    public function updateFitting(int $id, string $fittingDatetime): void
    {
        $this->booking
            ->newQuery()
            ->whereKey($id)
            ->update(['fitting_datetime' => $fittingDatetime]);
    }

    public function itemsForBooking(int $bookingId): array
    {
        return $this->item
            ->newQuery()
            ->where('booking_id', $bookingId)
            ->orderBy('id')
            ->get()
            ->map(fn ($row): array => $row->toArray())
            ->all();
    }
}
