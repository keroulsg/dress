<?php

declare(strict_types=1);

namespace App\Modules\KYC\Domain\Events;

use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

class KycVerified implements ShouldDispatchAfterCommit
{
    public function __construct(
        public readonly int $userId,
    ) {}
}
