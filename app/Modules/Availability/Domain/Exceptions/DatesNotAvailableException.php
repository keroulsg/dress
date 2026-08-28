<?php

declare(strict_types=1);

namespace App\Modules\Availability\Domain\Exceptions;

use RuntimeException;

class DatesNotAvailableException extends RuntimeException
{
    public function __construct(int $dressId, string $startDate, string $endDate)
    {
        parent::__construct(
            sprintf('The dress #%d is not available from %s to %s.', $dressId, $startDate, $endDate),
        );
    }
}
