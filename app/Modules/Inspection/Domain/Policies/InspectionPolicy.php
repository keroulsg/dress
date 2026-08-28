<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Domain\Policies;

use App\Modules\Atelier\Domain\Contracts\AtelierReader;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Identity\Domain\Entities\User;

class InspectionPolicy
{
    public function __construct(private readonly AtelierReader $ateliers) {}

    public function inspect(User $user, Booking $booking): bool
    {
        if ($user->isSuperadmin()) {
            return true;
        }

        if (! $this->ateliers->isStaff((int) $booking->atelier_id, $user->id)) {
            return false;
        }

        $role = $this->ateliers->staffRoleFor((int) $booking->atelier_id, $user->id);

        return $role === null || in_array($role, ['inspector', 'manager'], true);
    }
}
