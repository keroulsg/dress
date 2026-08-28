<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Application\Services;

use App\Modules\Dispute\Domain\Contracts\DisputeContract;
use App\Modules\Dispute\Domain\Enums\DisputeStatus;
use App\Modules\Dispute\Domain\Events\DisputeOpened;
use App\Modules\Dispute\Domain\Events\DisputeResolved;
use App\Modules\Dispute\Infrastructure\Repositories\DisputeRepository;
use Illuminate\Support\Facades\Event;
use InvalidArgumentException;
use RuntimeException;

class DisputeService implements DisputeContract
{
    private const TRANSITIONS = [
        'open' => ['under_review', 'resolved', 'rejected'],
        'under_review' => ['awaiting_customer', 'awaiting_atelier', 'resolved', 'rejected'],
        'awaiting_customer' => ['under_review', 'awaiting_atelier', 'resolved', 'rejected'],
        'awaiting_atelier' => ['under_review', 'awaiting_customer', 'resolved', 'rejected'],
        'resolved' => [],
        'rejected' => [],
    ];

    public function __construct(
        private readonly DisputeRepository $disputes,
    ) {}

    public function open(int $bookingId, int $openedBy, string $reason, string $description): int
    {
        $disputeId = $this->disputes->store($bookingId, $openedBy, $reason, $description);

        Event::dispatch(new DisputeOpened($disputeId, $bookingId));

        return $disputeId;
    }

    public function classify(int $disputeId, string $status, int $actorId): void
    {
        $target = DisputeStatus::from($status);
        $current = $this->requireDispute($disputeId)['status'];

        if (! in_array($target->value, self::TRANSITIONS[$current] ?? [], true)) {
            throw new InvalidArgumentException(sprintf('Dispute #%d cannot transition from "%s" to "%s".', $disputeId, $current, $status));
        }

        $this->disputes->updateStatus($disputeId, $target->value);
    }

    public function resolve(int $disputeId, string $resolution, int $resolvedBy): void
    {
        $dispute = $this->requireDispute($disputeId);

        if ($dispute['status'] === DisputeStatus::Resolved->value || $dispute['status'] === DisputeStatus::Rejected->value) {
            throw new InvalidArgumentException(sprintf('Dispute #%d is already closed.', $disputeId));
        }

        $this->disputes->updateStatus($disputeId, DisputeStatus::Resolved->value, $resolution, $resolvedBy);

        Event::dispatch(new DisputeResolved($disputeId, (int) $dispute['booking_id']));
    }

    public function reject(int $disputeId, int $resolvedBy): void
    {
        $dispute = $this->requireDispute($disputeId);

        if ($dispute['status'] === DisputeStatus::Resolved->value || $dispute['status'] === DisputeStatus::Rejected->value) {
            throw new InvalidArgumentException(sprintf('Dispute #%d is already closed.', $disputeId));
        }

        $this->disputes->updateStatus($disputeId, DisputeStatus::Rejected->value, null, $resolvedBy);

        Event::dispatch(new DisputeResolved($disputeId, (int) $dispute['booking_id']));
    }

    private function requireDispute(int $disputeId): array
    {
        $dispute = $this->disputes->find($disputeId);

        if ($dispute === null) {
            throw new RuntimeException(sprintf('Dispute #%d not found.', $disputeId));
        }

        return $dispute;
    }
}
