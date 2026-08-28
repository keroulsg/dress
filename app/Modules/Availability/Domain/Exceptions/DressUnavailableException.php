<?php

declare(strict_types=1);

namespace App\Modules\Availability\Domain\Exceptions;

use App\Modules\Availability\Domain\ValueObjects\DateRange;
use RuntimeException;

class DressUnavailableException extends RuntimeException
{
    public static function forDress(int $dressId, DateRange $range): self
    {
        return new self(
            sprintf(
                'Dress #%d is unavailable from %s to %s (including the turnaround buffer).',
                $dressId,
                $range->startDate()->toDateString(),
                $range->endDate()->toDateString(),
            ),
        );
    }
}
