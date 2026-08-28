<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Exceptions;

use RuntimeException;

class PaymentFailedException extends RuntimeException
{
    public static function gatewayError(string $gatewayMessage): self
    {
        return new self(sprintf('Payment gateway error: %s', $gatewayMessage));
    }
}
