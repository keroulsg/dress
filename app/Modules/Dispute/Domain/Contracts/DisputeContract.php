<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Domain\Contracts;

use App\Modules\Dispute\Application\DTOs\DisputeResolutionDTO;
use App\Modules\Dispute\Domain\Entities\Dispute;
use App\Modules\Dispute\Domain\Entities\DisputeMessage;

/**
 * Public contract for the Dispute module.
 */
interface DisputeContract
{
    public function open(int $bookingId, int $openedBy, string $reason, string $description): int;

    public function classify(int $disputeId, string $status, int $actorId): void;

    public function resolve(int $disputeId, string $resolution, int $resolvedBy): void;

    public function reject(int $disputeId, int $resolvedBy): void;

    public function openDispute(int $bookingId, int $openedBy, string $reason, string $description, ?array $evidence = null): Dispute;

    public function addDisputeMessage(int $disputeId, int $senderId, string $message, ?array $attachments = null, bool $isAdminNote = false): DisputeMessage;

    public function transitionStatus(int $disputeId, string $status, int $actorId): void;

    public function resolveDispute(int $disputeId, DisputeResolutionDTO $dto, int $resolvedBy): void;
}
