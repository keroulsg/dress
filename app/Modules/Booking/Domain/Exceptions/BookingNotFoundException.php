<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Exceptions;

use RuntimeException;

class BookingNotFoundException extends RuntimeException
{
    public function __construct(int $bookingId)
    {
        parent::__construct(sprintf('Booking #%d was not found.', $bookingId));
    }
}
