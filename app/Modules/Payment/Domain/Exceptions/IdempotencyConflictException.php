<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Exceptions;

use RuntimeException;

class IdempotencyConflictException extends RuntimeException
{
    public static function forKey(string $key, string $operation): self
    {
        return new self(sprintf('Idempotency key "%s" already used for %s.', $key, $operation));
    }
}
