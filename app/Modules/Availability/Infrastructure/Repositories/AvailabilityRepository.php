<?php

declare(strict_types=1);

namespace App\Modules\Availability\Infrastructure\Repositories;

use App\Modules\Availability\Domain\Entities\DressAvailability;

interface AvailabilityRepository
{
    public function bufferDaysFor(int $dressId): int;

    /**
     * Serializes concurrent booking attempts for a dress (pessimistic lock).
     */
    public function lockDressRow(int $dressId): void;

    /**
     * @return list<array<string, mixed>>
     */
    public function overlappingHolds(int $dressId, string $startDate, string $effectiveEndDate, ?int $excludeReferenceId = null): array;

    /**
     * Atomically inserts a hold unless an overlapping hold already exists
     * (checked against the effective end = requested end + buffer). Returns
     * whether the insert succeeded.
     */
    public function insertHoldIfNoOverlap(int $dressId, string $startDate, string $endDate, string $effectiveEndDate, string $referenceType, int $referenceId, string $reason): bool;

    public function insertHold(int $dressId, string $startDate, string $endDate, string $referenceType, int $referenceId, string $reason, ?string $notes = null): void;

    /**
     * @return list<array<string, mixed>>
     */
    public function holdsInRange(int $dressId, string $startDate, string $endDate): array;

    public function holdForReference(string $referenceType, int $referenceId, string $reason): ?DressAvailability;

    public function deleteHoldsForReference(string $referenceType, int $referenceId): int;
}
