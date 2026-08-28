<?php

declare(strict_types=1);

namespace App\Modules\Review\Domain\Contracts;

use App\Modules\Review\Application\DTOs\ReviewDTO;

/**
 * Public contract for the Review module.
 */
interface ReviewContract
{
    /**
     * Publishes a review only when the customer is eligible (completed rental,
     * within window, not already reviewed).
     */
    public function publish(ReviewDTO $dto): int;

    public function reply(int $reviewId, int $atelierId, string $reply): void;

    public function assertEligibility(int $bookingId, int $renterId): void;
}
