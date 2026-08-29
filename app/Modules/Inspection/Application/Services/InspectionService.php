<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Application\Services;

use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Inspection\Application\DTOs\AddDamageItemDTO;
use App\Modules\Inspection\Application\DTOs\CreateInspectionDTO;
use App\Modules\Inspection\Application\DTOs\InspectionSummaryDTO;
use App\Modules\Inspection\Domain\Contracts\InspectionContract;
use App\Modules\Inspection\Domain\Entities\InspectionDamageItem;
use App\Modules\Inspection\Domain\Entities\InspectionReport;
use App\Modules\Inspection\Domain\Enums\InspectionPhase;
use App\Modules\Inspection\Domain\Events\InspectionCompleted;
use App\Modules\Inspection\Domain\Exceptions\InspectionAlreadyFinalizedException;
use App\Modules\Inspection\Infrastructure\Repositories\InspectionRepository;
use App\Modules\Inventory\Domain\Contracts\InventoryStateManager;
use App\Modules\Media\Application\DTOs\StoredAssetDTO;
use App\Modules\Media\Domain\Contracts\MediaContract;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use RuntimeException;

/**
 * Garment quality control: baseline + return inspections, damage assessment,
 * evidence photos, deposit deduction clamping, and settlement synchronization.
 */
class InspectionService implements InspectionContract
{
    public function __construct(
        private readonly InspectionRepository $inspections,
        private readonly BookingOrchestratorContract $bookings,
        private readonly PaymentContract $payments,
        private readonly PricingContract $pricing,
        private readonly MediaContract $media,
        private readonly InventoryStateManager $inventory,
    ) {}

    public function createPreDispatchReport(int $bookingId, int $inspectorId, CreateInspectionDTO $dto): InspectionReport
    {
        $booking = $this->requireBooking($bookingId);
        $this->authorizeInspect($booking, $inspectorId);

        $reportId = $this->inspections->storeReport($bookingId, $inspectorId, InspectionPhase::PreDispatch->value, $dto->conditionSummary, $dto->damageDescription);
        $this->storeDamageItems($reportId, $dto->damageItems);

        // Baseline complete — the garment is ready for dispatch.
        $this->bookings->transitionStatus($bookingId, BookingStatus::ReadyForDispatch, ['actor_id' => $inspectorId]);

        return $this->requireEntity($reportId);
    }

    public function createPostReturnReport(int $bookingId, int $inspectorId, CreateInspectionDTO $dto): InspectionReport
    {
        $booking = $this->requireBooking($bookingId);
        $this->authorizeInspect($booking, $inspectorId);

        $reportId = $this->inspections->storeReport($bookingId, $inspectorId, InspectionPhase::PostReturn->value, $dto->conditionSummary, $dto->damageDescription);
        $this->storeDamageItems($reportId, $dto->damageItems);

        return $this->requireEntity($reportId);
    }

    public function addDamageItem(int $reportId, AddDamageItemDTO $dto): InspectionDamageItem
    {
        $report = $this->requireEntity($reportId);
        $this->authorizeInspect($this->requireBooking($report->booking_id), (int) auth()->id());

        $damageId = $this->inspections->storeDamageItem($reportId, [
            'location' => $dto->location,
            'damage_type' => $dto->damageType,
            'severity' => $dto->severity,
            'description' => $dto->description,
            'repair_cost' => $dto->repairCost,
            'deduction_amount' => $dto->deductionAmount,
            'photo_path' => $dto->photoFile !== null ? $this->storeEvidencePhoto($dto->photoFile)->path : null,
        ]);

        return InspectionDamageItem::query()->findOrFail($damageId);
    }

    public function finalizeInspection(int $reportId, int $actorId, ?Money $overrideDeduction = null): InspectionReport
    {
        $report = $this->requireEntity($reportId);
        $booking = $this->requireBooking($report->booking_id);
        $this->authorizeInspect($booking, $actorId);

        if ($this->inspections->isFinalized($reportId)) {
            throw InspectionAlreadyFinalizedException::forReport($reportId);
        }

        $currency = $booking->currency;
        $deposit = Money::fromDecimal($booking->security_deposit_amount, $currency);

        $approved = $overrideDeduction ?? $this->recommendedDeduction($reportId, $currency);
        $approved = $this->clampDeduction($approved, $deposit);

        $this->inspections->finalize($reportId, number_format($approved->toDecimal(), 2, '.', ''), $approved->isZero());

        if ($report->phase === InspectionPhase::PostReturn) {
            $this->bookings->transitionStatus($booking->id, BookingStatus::InspectionCompleted, ['actor_id' => null]);
            $this->settleAndComplete($booking, $report, $approved, $actorId);
        }

        Event::dispatch(new InspectionCompleted($reportId, $booking->id));

        return $this->requireEntity($reportId);
    }

    public function customerApproveInspection(int $reportId, int $renterId): void
    {
        $report = $this->requireEntity($reportId);
        $booking = $this->requireBooking($report->booking_id);

        if ($booking->renter_id !== $renterId) {
            throw new AuthorizationException('Only the renter may approve this inspection.');
        }

        if (! $this->inspections->isFinalized($reportId)) {
            throw new RuntimeException('Inspection must be finalized before approval.');
        }

        $this->inspections->markCustomerApproved($reportId);
    }

    public function getBookingInspectionSummary(int $bookingId): InspectionSummaryDTO
    {
        $reports = $this->inspections->reportsForBooking($bookingId);
        $currency = (string) config('pricing.currency', 'EGP');

        $pre = collect($reports)->firstWhere('phase', InspectionPhase::PreDispatch->value);
        $post = collect($reports)->firstWhere('phase', InspectionPhase::PostReturn->value);

        $postReturnId = $post['id'] ?? null;
        $total = '0';

        if ($postReturnId !== null) {
            foreach ($this->inspections->damageItems((int) $postReturnId) as $item) {
                $total = bcadd($total, (string) ($item['deduction_amount'] ?? 0), 2);
            }
        }

        return new InspectionSummaryDTO(
            preDispatchReport: $pre,
            postReturnReport: $post,
            totalDeductions: Money::fromDecimal($total, $currency),
            isFinalized: $postReturnId !== null && $this->inspections->isFinalized((int) $postReturnId),
            settlementStatus: ($post['customer_approved'] ?? false) ? 'settled' : (($post['approved_deposit_deduction'] ?? null) !== null ? 'pending_customer_approval' : 'open'),
        );
    }

    /**
     * @param  list<AddDamageItemDTO>  $items
     */
    private function storeDamageItems(int $reportId, array $items): void
    {
        foreach ($items as $item) {
            $this->inspections->storeDamageItem($reportId, [
                'location' => $item->location,
                'damage_type' => $item->damageType,
                'severity' => $item->severity,
                'description' => $item->description,
                'repair_cost' => $item->repairCost,
                'deduction_amount' => $item->deductionAmount,
                'photo_path' => $item->photoFile !== null ? $this->storeEvidencePhoto($item->photoFile)->path : null,
            ]);
        }
    }

    private function settleAndComplete(Booking $booking, InspectionReport $report, Money $approved, int $actorId): void
    {
        $currency = $booking->currency;
        $deposit = Money::fromDecimal($booking->security_deposit_amount, $currency);

        $dressId = $booking->items->first()?->dress_id;
        $lateDays = $this->lateDays($booking);
        $lateFees = $dressId !== null
            ? $this->pricing->calculateLateFee($dressId, $lateDays)
            : Money::zero($currency);

        $settlement = $this->pricing->calculateDepositDeduction($deposit, $approved, $lateFees);

        $this->payments->processDepositSettlement(
            $booking->id,
            $deposit,
            $settlement->damageDeduction,
            $settlement->netRefundableAmount,
            'inspection-'.$report->id,
        );

        $this->bookings->transitionStatus($booking->id, BookingStatus::Completed, ['actor_id' => null]);

        if ($dressId !== null) {
            $this->syncInventory($dressId, (string) $report->condition_summary, $actorId);
        }
    }

    private function syncInventory(int $dressId, string $conditionSummary, int $actorId): void
    {
        match ($conditionSummary) {
            'perfect', 'normal_wear' => $this->inventory->markCleaning($dressId, $actorId),
            'stain_repairable', 'torn_repairable' => $this->inventory->markMaintenance($dressId, $actorId),
            'total_loss' => $this->inventory->retire($dressId, $actorId),
            default => null,
        };
    }

    private function lateDays(Booking $booking): int
    {
        if ($booking->actual_returned_at === null) {
            return 0;
        }

        $returned = $booking->actual_returned_at->startOfDay();

        if ($booking->end_date === null || $returned->lte($booking->end_date->startOfDay())) {
            return 0;
        }

        return (int) $booking->end_date->startOfDay()->diffInDays($returned);
    }

    private function clampDeduction(Money $deduction, Money $deposit): Money
    {
        $zero = Money::zero($deduction->currency());

        if ($deduction->lessThan($zero)) {
            return $zero;
        }

        if ($deduction->greaterThan($deposit)) {
            return $deposit;
        }

        return $deduction;
    }

    private function recommendedDeduction(int $reportId, string $currency): Money
    {
        $total = '0';

        foreach ($this->inspections->damageItems($reportId) as $item) {
            $total = bcadd($total, (string) ($item['deduction_amount'] ?? 0), 2);
        }

        return Money::fromDecimal($total, $currency);
    }

    private function storeEvidencePhoto(UploadedFile $file): StoredAssetDTO
    {
        return $this->media->storeOptimizedImage([
            'tmp_name' => $file->getRealPath(),
            'directory' => 'inspections/'.(int) date('Y'),
        ]);
    }

    private function requireEntity(int $reportId): InspectionReport
    {
        $report = $this->inspections->findReportEntity($reportId);

        if ($report === null) {
            throw new RuntimeException(sprintf('Inspection report #%d not found.', $reportId));
        }

        return $report;
    }

    private function requireBooking(int $bookingId): Booking
    {
        $booking = Booking::query()->with('items')->find($bookingId);

        if ($booking === null) {
            throw new RuntimeException(sprintf('Booking #%d not found.', $bookingId));
        }

        return $booking;
    }

    private function authorizeInspect(Booking $booking, int $actorId): void
    {
        $user = User::query()->find($actorId);

        if ($user === null) {
            abort(403);
        }

        Gate::forUser($user)->authorize('inspect', $booking);
    }
}
