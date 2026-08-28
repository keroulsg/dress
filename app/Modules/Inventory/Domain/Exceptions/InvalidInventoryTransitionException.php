<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Domain\Exceptions;

use RuntimeException;

class InvalidInventoryTransitionException extends RuntimeException
{
    public static function from(string $from, string $to): self
    {
        return new self(sprintf('Inventory transition "%s -> %s" is not permitted.', $from, $to));
    }

    public static function unknownSource(string $current, string $to): self
    {
        return new self(sprintf('Unknown inventory status "%s" prevents transition to "%s".', $current, $to));
    }

    public static function invalidCleaningDays(int $days): self
    {
        return new self(sprintf('Cleaning duration must be at least 1 day, got %d.', $days));
    }
}
