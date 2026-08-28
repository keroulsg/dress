<?php

declare(strict_types=1);

namespace App\Modules\Review\Application\Services;

use App\Modules\Review\Application\DTOs\ReviewDTO;
use App\Modules\Review\Domain\Contracts\ReviewContract;
use App\Modules\Review\Domain\Exceptions\ReviewEligibilityException;
use App\Modules\Review\Infrastructure\Repositories\ReviewRepository;
use InvalidArgumentException;
use RuntimeException;

class ReviewService implements ReviewContract
{
    public function __construct(
        private readonly ReviewRepository $reviews,
    ) {}

    public function publish(ReviewDTO $dto): int
    {
        if ($dto->rating < 1 || $dto->rating > 5) {
            throw new InvalidArgumentException(sprintf('Review rating must be between 1 and 5, got %d.', $dto->rating));
        }

        $this->assertEligibility($dto->bookingId, $dto->renterId);

        return $this->reviews->store(
            $dto->bookingId,
            $dto->renterId,
            $dto->dressId,
            $dto->atelierId,
            $dto->rating,
            $dto->comment,
        );
    }

    public function reply(int $reviewId, int $atelierId, string $reply): void
    {
        if (! $this->reviews->isOwnedByAtelier($reviewId, $atelierId)) {
            throw new RuntimeException(sprintf('Atelier #%d does not own review #%d.', $atelierId, $reviewId));
        }

        $this->reviews->storeReply($reviewId, $atelierId, $reply);
    }

    public function assertEligibility(int $bookingId, int $renterId): void
    {
        $completed = $this->reviews->isBookingCompletedForRenter($bookingId, $renterId);
        $alreadyReviewed = $this->reviews->hasReviewForBooking($bookingId, $renterId);

        if (! $completed || $alreadyReviewed) {
            throw ReviewEligibilityException::notEligible($bookingId, $renterId);
        }
    }
}
