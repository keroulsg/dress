<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Exceptions;

use RuntimeException;

class UnbalancedLedgerEntryException extends RuntimeException
{
    public static function forTransaction(int $transactionId, string $debits, string $credits): self
    {
        return new self(
            sprintf('Ledger for transaction #%d is unbalanced (debits %s, credits %s).', $transactionId, $debits, $credits),
        );
    }
}
