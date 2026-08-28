<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Exceptions;

use RuntimeException;

class LedgerAccountNotFoundException extends RuntimeException
{
    public static function forCode(string $code): self
    {
        return new self(sprintf('Ledger account with code "%s" does not exist.', $code));
    }
}
