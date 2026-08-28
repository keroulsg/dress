<?php

declare(strict_types=1);

namespace App\Modules\Review\Infrastructure\Repositories;

interface ReviewRepository
{
    public function store(int $bookingId, int $renterId, int $dressId, int $atelierId, int $rating, string $comment): int;

    public function isBookingCompletedForRenter(int $bookingId, int $renterId): bool;

    public function hasReviewForBooking(int $bookingId, int $renterId): bool;

    public function find(int $reviewId): ?array;

    public function isOwnedByAtelier(int $reviewId, int $atelierId): bool;

    public function storeReply(int $reviewId, int $atelierId, string $reply): void;
}
