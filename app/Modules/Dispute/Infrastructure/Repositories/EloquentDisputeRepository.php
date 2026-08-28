<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Infrastructure\Repositories;

use App\Modules\Dispute\Domain\Entities\Dispute;

class EloquentDisputeRepository implements DisputeRepository
{
    public function __construct(
        private readonly Dispute $dispute,
    ) {}

    public function store(int $bookingId, int $openedBy, string $reason, string $description): int
    {
        return $this->dispute->create([
            'booking_id' => $bookingId,
            'opened_by' => $openedBy,
            'reason' => $reason,
            'description' => $description,
            'status' => 'open',
        ])->id;
    }

    public function find(int $disputeId): ?array
    {
        return $this->dispute->find($disputeId)?->toArray();
    }

    public function updateStatus(int $disputeId, string $status, ?string $resolution = null, ?int $resolvedBy = null): void
    {
        $this->dispute->whereKey($disputeId)->update(array_filter([
            'status' => $status,
            'resolution' => $resolution,
            'resolved_by' => $resolvedBy,
        ], static fn ($value): bool => $value !== null));
    }
}
