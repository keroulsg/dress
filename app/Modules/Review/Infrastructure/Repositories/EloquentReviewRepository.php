<?php

declare(strict_types=1);

namespace App\Modules\Review\Infrastructure\Repositories;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Review\Domain\Entities\Review;

class EloquentReviewRepository implements ReviewRepository
{
    public function __construct(
        private readonly Review $review,
        private readonly Booking $booking,
    ) {}

    public function store(int $bookingId, int $renterId, int $dressId, int $atelierId, int $rating, string $comment): int
    {
        return $this->review->create([
            'booking_id' => $bookingId,
            'renter_id' => $renterId,
            'dress_id' => $dressId,
            'atelier_id' => $atelierId,
            'rating' => $rating,
            'comment' => $comment,
        ])->id;
    }

    public function isBookingCompletedForRenter(int $bookingId, int $renterId): bool
    {
        return $this->booking
            ->whereKey($bookingId)
            ->where('renter_id', $renterId)
            ->where('status', 'completed')
            ->exists();
    }

    public function hasReviewForBooking(int $bookingId, int $renterId): bool
    {
        return $this->review
            ->where('booking_id', $bookingId)
            ->where('renter_id', $renterId)
            ->exists();
    }

    public function find(int $reviewId): ?array
    {
        return $this->review->find($reviewId)?->toArray();
    }

    public function isOwnedByAtelier(int $reviewId, int $atelierId): bool
    {
        return $this->review
            ->whereKey($reviewId)
            ->where('atelier_id', $atelierId)
            ->exists();
    }

    public function storeReply(int $reviewId, int $atelierId, string $reply): void
    {
        $this->review->whereKey($reviewId)->update([
            'atelier_reply' => $reply,
            'atelier_replied_at' => now(),
        ]);
    }
}
