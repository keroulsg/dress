<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Domain\Contracts;

use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Inventory\Domain\Enums\DressStatus;

/**
 * Public contract for the Inventory module.
 *
 * Inventory owns operational dress state and controlled transitions. Status
 * changes flow through this contract only; the frontend can never set a status
 * directly. State changes stay synchronized with the Availability engine.
 */
interface InventoryStateContract
{
    public function transitionStatus(int $dressId, DressStatus $targetStatus, ?string $reason = null): void;

    public function markForMaintenance(int $dressId, DateRange $range, string $issueDescription): void;

    public function completeMaintenance(int $dressId): void;

    public function markForCleaning(int $dressId, int $days): void;
}
