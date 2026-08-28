<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Domain\Contracts;

/**
 * Public contract for the Dispute module.
 */
interface DisputeContract
{
    public function open(int $bookingId, int $openedBy, string $reason, string $description): int;

    public function classify(int $disputeId, string $status, int $actorId): void;

    public function resolve(int $disputeId, string $resolution, int $resolvedBy): void;

    public function reject(int $disputeId, int $resolvedBy): void;
}
