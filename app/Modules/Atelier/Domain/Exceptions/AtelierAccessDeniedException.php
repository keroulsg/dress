<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Domain\Exceptions;

use RuntimeException;

class AtelierAccessDeniedException extends RuntimeException
{
    public static function forUser(int $atelierId, int $userId): self
    {
        return new self(sprintf('User #%d cannot manage atelier #%d.', $userId, $atelierId));
    }
}
