<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Domain\Contracts;

use App\Modules\Inspection\Application\DTOs\AddDamageItemDTO;
use App\Modules\Inspection\Application\DTOs\CreateInspectionDTO;
use App\Modules\Inspection\Application\DTOs\InspectionSummaryDTO;
use App\Modules\Inspection\Domain\Entities\InspectionDamageItem;
use App\Modules\Inspection\Domain\Entities\InspectionReport;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Public contract for the Inspection module.
 *
 * Owns pre-dispatch baselines, post-return damage assessment, evidence photos,
 * deposit deduction clamping, and financial settlement synchronization.
 */
interface InspectionContract
{
    public function createPreDispatchReport(int $bookingId, int $inspectorId, CreateInspectionDTO $dto): InspectionReport;

    public function createPostReturnReport(int $bookingId, int $inspectorId, CreateInspectionDTO $dto): InspectionReport;

    public function addDamageItem(int $reportId, AddDamageItemDTO $dto): InspectionDamageItem;

    /**
     * Finalizes a report: computes (and clamps) the approved deduction, settles
     * the deposit for post-return reports, syncs inventory, and transitions the
     * booking lifecycle. Idempotent; finalized reports are immutable.
     */
    public function finalizeInspection(int $reportId, int $actorId, ?Money $overrideDeduction = null): InspectionReport;

    public function customerApproveInspection(int $reportId, int $renterId): void;

    public function getBookingInspectionSummary(int $bookingId): InspectionSummaryDTO;
}
