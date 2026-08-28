<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Events;

use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

class PaymentRefunded implements ShouldDispatchAfterCommit
{
    public function __construct(
        public readonly int $transactionId,
        public readonly int $bookingId,
    ) {}
}
