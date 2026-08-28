<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Domain\Policies;

use App\Modules\Atelier\Domain\Contracts\AtelierReader;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Identity\Domain\Entities\User;

class DressPolicy
{
    public function __construct(private readonly AtelierReader $ateliers) {}

    public function view(?User $user, Dress $dress): bool
    {
        if ($dress->status === 'active') {
            return true;
        }

        if ($user === null) {
            return false;
        }

        return $this->managesAtelier($user, (int) $dress->atelier_id);
    }

    public function create(User $user): bool
    {
        if ($user->isSuperadmin() || $user->role === 'atelier_owner') {
            return true;
        }

        if ($user->role === 'atelier_staff') {
            return $user->staffMemberships()
                ->whereIn('role', ['inventory_manager', 'manager'])
                ->where('is_active', true)
                ->exists();
        }

        return false;
    }

    public function update(User $user, Dress $dress): bool
    {
        return $user->isSuperadmin() || $this->managesAtelier($user, (int) $dress->atelier_id);
    }

    public function delete(User $user, Dress $dress): bool
    {
        return $this->update($user, $dress);
    }

    private function managesAtelier(User $user, int $atelierId): bool
    {
        $owned = $this->ateliers->findForOwner($user->id);

        if ($owned !== null && $owned->atelierId === $atelierId) {
            return true;
        }

        return $this->ateliers->isStaff($atelierId, $user->id);
    }
}
