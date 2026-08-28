<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Domain\Contracts;

use App\Modules\Inspection\Application\DTOs\InspectionResultDTO;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Public contract for the Inspection module.
 *
 * Owns pre-dispatch and post-return inspection reports, damage assessment,
 * repair costs, and deposit deduction recommendations.
 */
interface InspectionContract
{
    public function createReport(int $bookingId, int $inspectorId, string $phase, string $conditionSummary): int;

    public function addDamageItem(int $reportId, array $damage): void;

    /**
     * Finalizes a report. Idempotent; a finalized report is immutable.
     */
    public function finalizeReport(int $reportId, Money $approvedDeduction, int $actorId): InspectionResultDTO;

    public function getReportResult(int $reportId): InspectionResultDTO;
}
