<?php

declare(strict_types=1);

namespace App\Modules\Review\Application\DTOs;

final readonly class ReviewDTO
{
    public function __construct(
        public int $bookingId,
        public int $renterId,
        public int $dressId,
        public int $atelierId,
        public int $rating,
        public string $comment,
    ) {}
}
