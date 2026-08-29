<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Domain\Exceptions;

use RuntimeException;

class InvalidCouponException extends RuntimeException
{
    public static function forCode(string $code): self
    {
        return new self(sprintf('Coupon "%s" is invalid or cannot be applied to this order.', $code));
    }
}
