<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Domain\Events;

use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

class InspectionCompleted implements ShouldDispatchAfterCommit
{
    public function __construct(
        public readonly int $reportId,
        public readonly int $bookingId,
    ) {}
}
