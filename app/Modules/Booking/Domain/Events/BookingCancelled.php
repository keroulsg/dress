<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Events;

use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

final class BookingCancelled implements ShouldDispatchAfterCommit
{
    public function __construct(
        public readonly int $bookingId,
        public readonly string $reason,
    ) {}
}
