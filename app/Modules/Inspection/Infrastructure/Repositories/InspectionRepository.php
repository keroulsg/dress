<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Infrastructure\Repositories;

interface InspectionRepository
{
    public function storeReport(int $bookingId, int $inspectorId, string $phase, string $conditionSummary): int;

    /**
     * @param  array{location?: string, damage_type?: string, severity?: string, description?: string|null, repair_cost?: float|int|string, deduction_amount?: float|int|string, photo_path?: string|null}  $damage
     */
    public function storeDamageItem(int $reportId, array $damage): void;

    /**
     * @return array<string, mixed>|null
     */
    public function findReport(int $reportId): ?array;

    public function isFinalized(int $reportId): bool;

    public function finalize(int $reportId, string $approvedDeduction, int $actorId): void;

    /**
     * @return list<array<string, mixed>>
     */
    public function damageItems(int $reportId): array;
}
