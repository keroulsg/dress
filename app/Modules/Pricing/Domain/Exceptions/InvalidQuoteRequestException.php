<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Domain\Exceptions;

use RuntimeException;

class InvalidQuoteRequestException extends RuntimeException
{
    public static function nonPositiveRentalDays(): self
    {
        return new self('Rental days must be at least 1.');
    }

    public static function emptyItems(): self
    {
        return new self('A pricing quote requires at least one dress item.');
    }

    public static function negativeLateDays(): self
    {
        return new self('Late days cannot be negative.');
    }
}
