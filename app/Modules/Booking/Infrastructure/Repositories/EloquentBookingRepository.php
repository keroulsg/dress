<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Repositories;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Entities\BookingItem;
use Carbon\CarbonInterface;

class EloquentBookingRepository implements BookingRepository
{
    public function __construct(
        private readonly Booking $booking,
        private readonly BookingItem $item,
    ) {}

    public function find(int $id): ?Booking
    {
        return $this->booking->newQuery()
            ->with('items')
            ->find($id);
    }

    public function findByClientToken(string $clientToken): ?Booking
    {
        return $this->booking->newQuery()
            ->with('items')
            ->where('client_token', $clientToken)
            ->first();
    }

    public function referenceExists(string $bookingReference): bool
    {
        return $this->booking->newQuery()
            ->where('booking_reference', $bookingReference)
            ->exists();
    }

    public function createBooking(array $data): Booking
    {
        return $this->booking->newQuery()->create($data);
    }

    public function createItem(int $bookingId, array $data): void
    {
        $this->item->newQuery()->create([...$data, 'booking_id' => $bookingId]);
    }

    public function save(Booking $booking): void
    {
        $booking->save();
    }

    public function updateStatus(int $id, string $status): void
    {
        $this->booking->newQuery()->whereKey($id)->update(['status' => $status]);
    }

    public function updateFitting(int $id, string $fittingDatetime): void
    {
        $this->booking->newQuery()->whereKey($id)->update(['fitting_datetime' => $fittingDatetime]);
    }

    public function itemsForBooking(int $bookingId): array
    {
        return $this->item->newQuery()
            ->where('booking_id', $bookingId)
            ->orderBy('id')
            ->get()
            ->map(fn ($row): array => $row->toArray())
            ->all();
    }

    public function pendingExpired(CarbonInterface $threshold): array
    {
        return $this->booking->newQuery()
            ->with('items')
            ->where('status', 'pending_payment')
            ->where('created_at', '<', $threshold)
            ->orderBy('id')
            ->get()
            ->all();
    }
}
