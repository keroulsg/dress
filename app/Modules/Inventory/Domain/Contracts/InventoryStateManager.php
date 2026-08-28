<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Domain\Contracts;

/**
 * Public contract for the Inventory module.
 *
 * Inventory owns operational dress state and controlled transitions. Status
 * changes flow through this manager only; the frontend can never set a status
 * directly.
 */
interface InventoryStateManager
{
    public function reserve(int $dressId, int $actorId): void;

    public function markRented(int $dressId, int $actorId): void;

    public function markCleaning(int $dressId, int $actorId): void;

    public function markMaintenance(int $dressId, int $actorId, ?string $reason = null): void;

    public function markAlteration(int $dressId, int $actorId): void;

    public function markAvailable(int $dressId, int $actorId): void;

    public function retire(int $dressId, int $actorId): void;

    public function currentState(int $dressId): string;
}
