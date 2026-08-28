<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Domain\Events;

use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

class DisputeOpened implements ShouldDispatchAfterCommit
{
    public function __construct(
        public readonly int $disputeId,
        public readonly int $bookingId,
    ) {}
}
