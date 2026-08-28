<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Domain\Exceptions;

use RuntimeException;

class InvalidAmountException extends RuntimeException
{
    public static function negative(string $message = 'Money amount cannot be negative.'): self
    {
        return new self($message);
    }
}
