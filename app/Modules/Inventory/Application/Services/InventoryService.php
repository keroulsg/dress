<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Application\Services;

use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Domain\Enums\AvailabilityHoldReason;
use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Inventory\Domain\Contracts\InventoryStateContract;
use App\Modules\Inventory\Domain\Contracts\InventoryStateManager;
use App\Modules\Inventory\Domain\Enums\DressStatus;
use App\Modules\Inventory\Domain\Exceptions\InvalidInventoryTransitionException;
use App\Modules\Inventory\Infrastructure\Repositories\InventoryRepository;

class InventoryService implements InventoryStateContract, InventoryStateManager
{
    /**
     * @var array<string, list<string>>
     */
    private const TRANSITIONS = [
        DressStatus::Draft->value => [DressStatus::Active->value, DressStatus::Retired->value],
        DressStatus::Active->value => [DressStatus::Reserved->value, DressStatus::Maintenance->value, DressStatus::Cleaning->value, DressStatus::Alteration->value, DressStatus::Retired->value],
        DressStatus::Reserved->value => [DressStatus::Rented->value, DressStatus::Active->value, DressStatus::Maintenance->value, DressStatus::Cleaning->value],
        DressStatus::Rented->value => [DressStatus::Cleaning->value, DressStatus::Maintenance->value, DressStatus::Alteration->value, DressStatus::Active->value],
        DressStatus::Cleaning->value => [DressStatus::Active->value, DressStatus::Maintenance->value, DressStatus::Alteration->value],
        DressStatus::Maintenance->value => [DressStatus::Active->value, DressStatus::Retired->value],
        DressStatus::Alteration->value => [DressStatus::Active->value, DressStatus::Maintenance->value, DressStatus::Cleaning->value],
        DressStatus::Retired->value => [DressStatus::Active->value],
    ];

    public function __construct(
        private readonly InventoryRepository $repository,
        private readonly AvailabilityContract $availability,
    ) {}

    public function transitionStatus(int $dressId, DressStatus $targetStatus, ?string $reason = null): void
    {
        $current = $this->repository->currentStatus($dressId);
        $from = DressStatus::tryFrom($current);

        if ($from === null) {
            throw InvalidInventoryTransitionException::unknownSource($current, $targetStatus->value);
        }

        if (! in_array($targetStatus->value, self::TRANSITIONS[$from->value] ?? [], true)) {
            throw InvalidInventoryTransitionException::from($from->value, $targetStatus->value);
        }

        $this->repository->updateStatus($dressId, $targetStatus->value);
    }

    public function markForMaintenance(int $dressId, DateRange $range, string $issueDescription): void
    {
        $this->transitionStatus($dressId, DressStatus::Maintenance);

        $this->availability->createOperationalBlock(
            $dressId,
            $range,
            AvailabilityHoldReason::Maintenance->value,
            $issueDescription,
        );
    }

    public function completeMaintenance(int $dressId): void
    {
        $this->availability->releaseDatesForBooking(AvailabilityHoldReason::Maintenance->value, $dressId);
        $this->transitionStatus($dressId, DressStatus::Active);
    }

    public function markForCleaning(int $dressId, int $days): void
    {
        if ($days < 1) {
            throw InvalidInventoryTransitionException::invalidCleaningDays($days);
        }

        $this->transitionStatus($dressId, DressStatus::Cleaning);

        $range = DateRange::between(now()->startOfDay(), now()->addDays(max(0, $days - 1))->startOfDay());

        $this->availability->createOperationalBlock(
            $dressId,
            $range,
            AvailabilityHoldReason::Cleaning->value,
        );
    }

    public function reserve(int $dressId, int $actorId): void
    {
        $this->transitionStatus($dressId, DressStatus::Reserved);
    }

    public function markRented(int $dressId, int $actorId): void
    {
        $this->transitionStatus($dressId, DressStatus::Rented);
    }

    public function markCleaning(int $dressId, int $actorId): void
    {
        $this->transitionStatus($dressId, DressStatus::Cleaning);
    }

    public function markMaintenance(int $dressId, int $actorId, ?string $reason = null): void
    {
        $this->transitionStatus($dressId, DressStatus::Maintenance, $reason);
    }

    public function markAlteration(int $dressId, int $actorId): void
    {
        $this->transitionStatus($dressId, DressStatus::Alteration);
    }

    public function markAvailable(int $dressId, int $actorId): void
    {
        $this->transitionStatus($dressId, DressStatus::Active);
    }

    public function retire(int $dressId, int $actorId): void
    {
        $this->transitionStatus($dressId, DressStatus::Retired);
    }

    public function currentState(int $dressId): string
    {
        return $this->repository->currentStatus($dressId);
    }
}
