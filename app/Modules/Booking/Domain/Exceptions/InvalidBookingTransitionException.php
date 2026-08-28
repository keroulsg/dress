<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Exceptions;

use RuntimeException;

class InvalidBookingTransitionException extends RuntimeException
{
    public static function from(string $from, string $to): self
    {
        return new self(sprintf('Booking transition "%s -> %s" is not permitted.', $from, $to));
    }
}
