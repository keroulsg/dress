<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Exceptions;

use RuntimeException;

class BookingCheckoutException extends RuntimeException
{
    public static function kycRequired(): self
    {
        return new self('Identity verification (KYC) is required before booking.');
    }

    public static function ineligibleRenter(): self
    {
        return new self('The renter is not eligible to place bookings.');
    }
}
