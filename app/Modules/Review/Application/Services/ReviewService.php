<?php

declare(strict_types=1);

namespace App\Modules\Review\Application\Services;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Review\Application\DTOs\ReviewDTO;
use App\Modules\Review\Domain\Contracts\ReviewContract;
use App\Modules\Review\Domain\Entities\Review;
use App\Modules\Review\Domain\Exceptions\ReviewEligibilityException;
use App\Modules\Review\Infrastructure\Repositories\ReviewRepository;
use Illuminate\Support\Facades\DB;
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

        return DB::transaction(function () use ($dto) {
            $id = $this->reviews->store(
                $dto->bookingId,
                $dto->renterId,
                $dto->dressId,
                $dto->atelierId,
                $dto->rating,
                $dto->comment,
            );

            $this->recalculateDressRating($dto->dressId);
            $this->recalculateAtelierRating($dto->atelierId);

            return $id;
        });
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
        $booking = Booking::find($bookingId);

        if (! $booking || $booking->renter_id !== $renterId || $booking->status !== BookingStatus::Completed) {
            throw ReviewEligibilityException::notEligible($bookingId, $renterId);
        }

        if (Review::where('booking_id', $bookingId)->exists()) {
            throw ReviewEligibilityException::notEligible($bookingId, $renterId);
        }
    }

    private function recalculateDressRating(int $dressId): void
    {
        $reviews = Review::where('dress_id', $dressId)->get(['rating']);
        $count = $reviews->count();
        if ($count === 0) {
            return;
        }

        $sum = '0';
        foreach ($reviews as $review) {
            $sum = bcadd($sum, (string) $review->rating, 2);
        }

        $average = bcdiv($sum, (string) $count, 2);
        Dress::where('id', $dressId)->update([
            'rating_count' => $count,
            'rating_average' => $average,
        ]);
    }

    private function recalculateAtelierRating(int $atelierId): void
    {
        $reviews = Review::where('atelier_id', $atelierId)->get(['rating']);
        $count = $reviews->count();
        if ($count === 0) {
            return;
        }

        $sum = '0';
        foreach ($reviews as $review) {
            $sum = bcadd($sum, (string) $review->rating, 2);
        }

        $average = bcdiv($sum, (string) $count, 2);
        Atelier::where('id', $atelierId)->update([
            'rating_average' => $average,
        ]);
    }
}
