<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Events;

use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

final class DepositSettled implements ShouldDispatchAfterCommit
{
    public function __construct(
        public readonly int $bookingId,
        public readonly int $transactionId,
        public readonly Money $depositHeld,
        public readonly Money $deductionAmount,
        public readonly Money $refundAmount,
    ) {}
}
