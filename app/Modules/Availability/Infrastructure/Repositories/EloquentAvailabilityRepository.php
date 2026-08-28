<?php

declare(strict_types=1);

namespace App\Modules\Availability\Infrastructure\Repositories;

use App\Modules\Availability\Domain\Entities\DressAvailability;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Support\Facades\DB;

class EloquentAvailabilityRepository implements AvailabilityRepository
{
    public function bufferDaysFor(int $dressId): int
    {
        $buffer = Dress::query()->whereKey($dressId)->value('turnaround_buffer_days');

        return $buffer === null ? (int) config('availability.default_buffer_days', 2) : (int) $buffer;
    }

    public function lockDressRow(int $dressId): void
    {
        Dress::query()->whereKey($dressId)->lockForUpdate()->first();
    }

    public function overlappingHolds(int $dressId, string $startDate, string $effectiveEndDate, ?int $excludeReferenceId = null): array
    {
        $query = DressAvailability::query()
            ->where('dress_id', $dressId)
            ->where('end_date', '>=', $startDate)
            ->where('start_date', '<=', $effectiveEndDate);

        if ($excludeReferenceId !== null) {
            $query->where('reference_id', '!=', $excludeReferenceId);
        }

        return $query->get()->toArray();
    }

    public function insertHoldIfNoOverlap(int $dressId, string $startDate, string $endDate, string $effectiveEndDate, string $referenceType, int $referenceId, string $reason): bool
    {
        $now = now();

        return DB::affectingStatement(
            'INSERT INTO dress_availabilities
                (dress_id, start_date, end_date, reason, reference_type, reference_id, notes, created_at, updated_at)
             SELECT ?, ?, ?, ?, ?, ?, NULL, ?, ?
             WHERE NOT EXISTS (
                SELECT 1 FROM dress_availabilities
                WHERE dress_id = ?
                  AND end_date >= ?
                  AND start_date <= ?
             )',
            [$dressId, $startDate, $endDate, $reason, $referenceType, $referenceId, $now, $now, $dressId, $startDate, $effectiveEndDate],
        ) === 1;
    }

    public function insertHold(int $dressId, string $startDate, string $endDate, string $referenceType, int $referenceId, string $reason, ?string $notes = null): void
    {
        DressAvailability::query()->create([
            'dress_id' => $dressId,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'reason' => $reason,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'notes' => $notes,
        ]);
    }

    public function holdsInRange(int $dressId, string $startDate, string $endDate): array
    {
        return DressAvailability::query()
            ->where('dress_id', $dressId)
            ->where('start_date', '<=', $endDate)
            ->where('end_date', '>=', $startDate)
            ->orderBy('start_date')
            ->get()
            ->toArray();
    }

    public function holdForReference(string $referenceType, int $referenceId, string $reason): ?DressAvailability
    {
        return DressAvailability::query()
            ->where('reference_type', $referenceType)
            ->where('reference_id', $referenceId)
            ->where('reason', $reason)
            ->orderByDesc('id')
            ->first();
    }

    public function deleteHoldsForReference(string $referenceType, int $referenceId): int
    {
        return DressAvailability::query()
            ->where('reference_type', $referenceType)
            ->where('reference_id', $referenceId)
            ->delete();
    }
}
