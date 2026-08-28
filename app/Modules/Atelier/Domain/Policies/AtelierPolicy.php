<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Domain\Policies;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Identity\Domain\Entities\User;

class AtelierPolicy
{
    public function view(User $user, Atelier $atelier): bool
    {
        if ($user->isSuperadmin()) {
            return true;
        }

        if ($atelier->isOwner($user)) {
            return true;
        }

        return $atelier->staffRoleForUser($user) !== null && (bool) $atelier->is_active;
    }

    public function update(User $user, Atelier $atelier): bool
    {
        return $user->isSuperadmin() || $atelier->isOwner($user);
    }

    public function manageStaff(User $user, Atelier $atelier): bool
    {
        return $user->isSuperadmin() || $atelier->isOwner($user);
    }
}
