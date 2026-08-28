<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Infrastructure\Repositories;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Domain\Entities\AtelierStaff;

class EloquentAtelierRepository implements AtelierRepository
{
    public function findById(int $atelierId): ?Atelier
    {
        return Atelier::query()->find($atelierId);
    }

    public function findForOwner(int $userId): ?Atelier
    {
        return Atelier::query()->where('owner_user_id', $userId)->first();
    }

    public function staffRoleFor(int $atelierId, int $userId): ?string
    {
        $role = AtelierStaff::query()
            ->where('atelier_id', $atelierId)
            ->where('user_id', $userId)
            ->value('role');

        return $role === null ? null : (string) $role;
    }
}
