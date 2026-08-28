<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Infrastructure\Repositories;

use App\Modules\Catalog\Domain\Entities\Dress;
use RuntimeException;

class EloquentInventoryRepository implements InventoryRepository
{
    public function updateStatus(int $dressId, string $status): void
    {
        Dress::query()->whereKey($dressId)->update(['status' => $status]);
    }

    public function currentStatus(int $dressId): string
    {
        $status = Dress::query()->whereKey($dressId)->value('status');

        if ($status === null) {
            throw new RuntimeException(sprintf('Dress #%d was not found.', $dressId));
        }

        return (string) $status;
    }
}
