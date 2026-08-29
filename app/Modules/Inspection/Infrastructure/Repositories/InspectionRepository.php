<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Infrastructure\Repositories;

use App\Modules\Inspection\Domain\Entities\InspectionReport;

interface InspectionRepository
{
    public function storeReport(int $bookingId, int $inspectorId, string $phase, string $conditionSummary, ?string $damageDescription = null): int;

    /**
     * @param  array{location: string, damage_type: string, severity: string, description?: string|null, repair_cost?: float|int|string, deduction_amount?: float|int|string, photo_path?: string|null}  $damage
     */
    public function storeDamageItem(int $reportId, array $damage): int;

    /**
     * @return array<string, mixed>|null
     */
    public function findReport(int $reportId): ?array;

    public function findReportEntity(int $reportId): ?InspectionReport;

    public function isFinalized(int $reportId): bool;

    public function finalize(int $reportId, string $approvedDeduction, bool $autoApproved): void;

    public function markCustomerApproved(int $reportId): void;

    /**
     * @return list<array<string, mixed>>
     */
    public function damageItems(int $reportId): array;

    /**
     * @return list<array<string, mixed>>
     */
    public function reportsForBooking(int $bookingId): array;
}
