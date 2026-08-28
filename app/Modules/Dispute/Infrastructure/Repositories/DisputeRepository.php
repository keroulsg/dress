<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Infrastructure\Repositories;

interface DisputeRepository
{
    public function store(int $bookingId, int $openedBy, string $reason, string $description): int;

    public function find(int $disputeId): ?array;

    public function updateStatus(int $disputeId, string $status, ?string $resolution = null, ?int $resolvedBy = null): void;
}
