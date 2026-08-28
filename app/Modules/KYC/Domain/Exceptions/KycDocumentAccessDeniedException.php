<?php

declare(strict_types=1);

namespace App\Modules\KYC\Domain\Exceptions;

use RuntimeException;

class KycDocumentAccessDeniedException extends RuntimeException
{
    public static function forUser(int $userId): self
    {
        return new self(sprintf('KYC document access denied for user #%d.', $userId));
    }
}
