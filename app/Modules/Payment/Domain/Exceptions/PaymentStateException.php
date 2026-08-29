<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Exceptions;

use RuntimeException;

class PaymentStateException extends RuntimeException
{
    public static function bookingNotPayable(int $bookingId, string $status): self
    {
        return new self(sprintf('Booking #%d is in state "%s" and cannot be paid.', $bookingId, $status));
    }
}
