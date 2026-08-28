<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Infrastructure\Repositories;

interface InventoryRepository
{
    public function updateStatus(int $dressId, string $status): void;

    public function currentStatus(int $dressId): string;
}
