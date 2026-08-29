<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Exceptions;

use RuntimeException;

class InsufficientPayoutBalanceException extends RuntimeException
{
    public static function forAtelier(int $atelierId, string $available): self
    {
        return new self(sprintf('Atelier #%d has only %s available for payout.', $atelierId, $available));
    }
}
