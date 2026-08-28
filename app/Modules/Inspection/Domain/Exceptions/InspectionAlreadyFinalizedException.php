<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Domain\Exceptions;

use RuntimeException;

class InspectionAlreadyFinalizedException extends RuntimeException
{
    public static function forReport(int $reportId): self
    {
        return new self(sprintf('Inspection report #%d is already finalized.', $reportId));
    }
}
