<?php

declare(strict_types=1);

namespace App\Modules\Review\Domain\Exceptions;

use RuntimeException;

class ReviewEligibilityException extends RuntimeException
{
    public static function notEligible(int $bookingId, int $renterId): self
    {
        return new self(sprintf('Customer #%d is not eligible to review booking #%d.', $renterId, $bookingId));
    }
}
