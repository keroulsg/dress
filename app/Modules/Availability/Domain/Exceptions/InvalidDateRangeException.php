<?php

declare(strict_types=1);

namespace App\Modules\Availability\Domain\Exceptions;

use RuntimeException;

class InvalidDateRangeException extends RuntimeException
{
    public static function endBeforeStart(): self
    {
        return new self('The end date must be on or after the start date.');
    }

    public static function negativeBuffer(): self
    {
        return new self('The buffer must be zero or a positive number of days.');
    }

    public static function startInPast(): self
    {
        return new self('The start date must not be in the past.');
    }

    public static function exceedsMaxDuration(int $days, int $max): self
    {
        return new self(sprintf('The rental duration of %d days exceeds the maximum of %d days.', $days, $max));
    }
}
