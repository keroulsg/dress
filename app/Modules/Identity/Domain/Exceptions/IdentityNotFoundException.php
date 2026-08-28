<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\Exceptions;

use RuntimeException;

class IdentityNotFoundException extends RuntimeException
{
    public static function forUser(int $userId): self
    {
        return new self(sprintf('User #%d was not found.', $userId));
    }
}
