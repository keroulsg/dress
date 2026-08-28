<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Application\Services;

use App\Modules\Inspection\Application\DTOs\InspectionResultDTO;
use App\Modules\Inspection\Domain\Contracts\InspectionContract;
use App\Modules\Inspection\Domain\Events\InspectionCompleted;
use App\Modules\Inspection\Domain\Exceptions\InspectionAlreadyFinalizedException;
use App\Modules\Inspection\Infrastructure\Repositories\InspectionRepository;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Support\Facades\Event;
use RuntimeException;

class InspectionService implements InspectionContract
{
    public function __construct(
        private readonly InspectionRepository $inspections,
    ) {}

    public function createReport(int $bookingId, int $inspectorId, string $phase, string $conditionSummary): int
    {
        return $this->inspections->storeReport($bookingId, $inspectorId, $phase, $conditionSummary);
    }

    public function addDamageItem(int $reportId, array $damage): void
    {
        $this->inspections->storeDamageItem($reportId, $damage);
    }

    public function finalizeReport(int $reportId, Money $approvedDeduction, int $actorId): InspectionResultDTO
    {
        if ($this->inspections->isFinalized($reportId)) {
            throw InspectionAlreadyFinalizedException::forReport($reportId);
        }

        $zero = Money::zero($approvedDeduction->currency());
        $clamped = $approvedDeduction->lessThan($zero) ? $zero : $approvedDeduction;

        $this->inspections->finalize($reportId, number_format($clamped->toDecimal(), 2, '.', ''), $actorId);

        $report = $this->requireReport($reportId);

        Event::dispatch(new InspectionCompleted($reportId, (int) $report['booking_id']));

        return $this->getReportResult($reportId);
    }

    public function getReportResult(int $reportId): InspectionResultDTO
    {
        $report = $this->requireReport($reportId);
        $currency = (string) config('pricing.currency', 'EGP');

        return new InspectionResultDTO(
            reportId: $reportId,
            bookingId: (int) $report['booking_id'],
            phase: (string) $report['phase'],
            conditionSummary: (string) $report['condition_summary'],
            recommendedDeduction: $this->recommendedDeduction($reportId, $currency),
            approvedDeduction: Money::fromDecimal((float) ($report['approved_deposit_deduction'] ?? 0), $currency),
            customerApproved: (bool) ($report['customer_approved'] ?? false),
            damageDescription: $this->damageDescription($reportId),
        );
    }

    private function requireReport(int $reportId): array
    {
        $report = $this->inspections->findReport($reportId);

        if ($report === null) {
            throw new RuntimeException(sprintf('Inspection report #%d not found.', $reportId));
        }

        return $report;
    }

    private function recommendedDeduction(int $reportId, string $currency): Money
    {
        $total = '0';

        foreach ($this->inspections->damageItems($reportId) as $item) {
            $total = bcadd($total, (string) ($item['deduction_amount'] ?? 0), 2);
        }

        return Money::fromDecimal($total, $currency);
    }

    private function damageDescription(int $reportId): ?string
    {
        $descriptions = array_values(array_filter(array_map(
            static fn (array $item): ?string => isset($item['description']) ? (string) $item['description'] : null,
            $this->inspections->damageItems($reportId),
        )));

        return $descriptions === [] ? null : implode('; ', $descriptions);
    }
}
