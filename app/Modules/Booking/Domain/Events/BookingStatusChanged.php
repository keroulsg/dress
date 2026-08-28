<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Events;

use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

class BookingStatusChanged implements ShouldDispatchAfterCommit
{
    public function __construct(
        public readonly int $bookingId,
        public readonly string $from,
        public readonly string $to,
    ) {}
}
