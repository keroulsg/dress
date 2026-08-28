<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Infrastructure\Repositories;

use App\Modules\Inspection\Domain\Entities\InspectionDamageItem;
use App\Modules\Inspection\Domain\Entities\InspectionReport;

class EloquentInspectionRepository implements InspectionRepository
{
    public function __construct(
        private readonly InspectionReport $report,
        private readonly InspectionDamageItem $damageItem,
    ) {}

    public function storeReport(int $bookingId, int $inspectorId, string $phase, string $conditionSummary): int
    {
        return $this->report->create([
            'booking_id' => $bookingId,
            'inspector_id' => $inspectorId,
            'phase' => $phase,
            'condition_summary' => $conditionSummary,
        ])->id;
    }

    public function storeDamageItem(int $reportId, array $damage): void
    {
        $this->damageItem->create([
            'inspection_report_id' => $reportId,
            'location' => $damage['location'] ?? 'other',
            'damage_type' => $damage['damage_type'] ?? 'other',
            'severity' => $damage['severity'] ?? 'minor',
            'description' => $damage['description'] ?? null,
            'repair_cost' => number_format((float) ($damage['repair_cost'] ?? 0), 2, '.', ''),
            'deduction_amount' => number_format((float) ($damage['deduction_amount'] ?? 0), 2, '.', ''),
            'photo_path' => $damage['photo_path'] ?? null,
        ]);
    }

    public function findReport(int $reportId): ?array
    {
        return $this->report->find($reportId)?->toArray();
    }

    public function isFinalized(int $reportId): bool
    {
        return $this->report
            ->whereKey($reportId)
            ->whereNotNull('customer_approved_at')
            ->exists();
    }

    public function finalize(int $reportId, string $approvedDeduction, int $actorId): void
    {
        $this->report->whereKey($reportId)->update([
            'approved_deposit_deduction' => $approvedDeduction,
            'customer_approved' => true,
            'customer_approved_at' => now(),
        ]);
    }

    public function damageItems(int $reportId): array
    {
        return $this->damageItem->where('inspection_report_id', $reportId)->get()->toArray();
    }
}
