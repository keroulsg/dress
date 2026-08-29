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

    public function storeReport(int $bookingId, int $inspectorId, string $phase, string $conditionSummary, ?string $damageDescription = null): int
    {
        return $this->report->newQuery()->create([
            'booking_id' => $bookingId,
            'inspector_id' => $inspectorId,
            'phase' => $phase,
            'condition_summary' => $conditionSummary,
            'damage_description' => $damageDescription,
        ])->id;
    }

    public function storeDamageItem(int $reportId, array $damage): int
    {
        return $this->damageItem->newQuery()->create([
            'inspection_report_id' => $reportId,
            'location' => $damage['location'],
            'damage_type' => $damage['damage_type'],
            'severity' => $damage['severity'],
            'description' => $damage['description'] ?? null,
            'repair_cost' => number_format((float) ($damage['repair_cost'] ?? 0), 2, '.', ''),
            'deduction_amount' => number_format((float) ($damage['deduction_amount'] ?? 0), 2, '.', ''),
            'photo_path' => $damage['photo_path'] ?? null,
        ])->id;
    }

    public function findReport(int $reportId): ?array
    {
        return $this->report->newQuery()->with('damageItems')->find($reportId)?->toArray();
    }

    public function findReportEntity(int $reportId): ?InspectionReport
    {
        return $this->report->newQuery()->with(['damageItems', 'booking.items'])->find($reportId);
    }

    public function isFinalized(int $reportId): bool
    {
        return $this->report->newQuery()
            ->whereKey($reportId)
            ->whereNotNull('finalized_at')
            ->exists();
    }

    public function finalize(int $reportId, string $approvedDeduction, bool $autoApproved): void
    {
        $this->report->newQuery()->whereKey($reportId)->update([
            'approved_deposit_deduction' => $approvedDeduction,
            'customer_approved' => $autoApproved,
            'customer_approved_at' => $autoApproved ? now() : null,
            'finalized_at' => now(),
        ]);
    }

    public function markCustomerApproved(int $reportId): void
    {
        $this->report->newQuery()->whereKey($reportId)->update([
            'customer_approved' => true,
            'customer_approved_at' => now(),
        ]);
    }

    public function damageItems(int $reportId): array
    {
        return $this->damageItem->newQuery()
            ->where('inspection_report_id', $reportId)
            ->orderBy('id')
            ->get()
            ->toArray();
    }

    public function reportsForBooking(int $bookingId): array
    {
        return $this->report->newQuery()
            ->with('damageItems')
            ->where('booking_id', $bookingId)
            ->orderBy('phase')
            ->get()
            ->toArray();
    }
}
