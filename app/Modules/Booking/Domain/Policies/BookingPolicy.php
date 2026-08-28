<?php

declare(strict_types=1);

namespace App\Modules\Booking\Domain\Policies;

use App\Modules\Atelier\Domain\Contracts\AtelierReader;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Identity\Domain\Entities\User;

class BookingPolicy
{
    public function __construct(private readonly AtelierReader $ateliers) {}

    public function view(User $user, Booking $booking): bool
    {
        if ($user->isSuperadmin()) {
            return true;
        }

        if ($booking->renter_id === $user->id) {
            return true;
        }

        return $this->managesAtelier($user, (int) $booking->atelier_id);
    }

    public function cancel(User $user, Booking $booking): bool
    {
        if ($user->isSuperadmin() || $this->managesAtelier($user, (int) $booking->atelier_id)) {
            return true;
        }

        if ($booking->renter_id === $user->id) {
            return in_array($booking->status, ['pending_payment', 'confirmed', 'fitting_scheduled'], true);
        }

        return false;
    }

    public function updateStatus(User $user, Booking $booking): bool
    {
        if ($user->isSuperadmin()) {
            return true;
        }

        if (! $this->managesAtelier($user, (int) $booking->atelier_id)) {
            return false;
        }

        $role = $this->ateliers->staffRoleFor((int) $booking->atelier_id, $user->id);

        return $role === null || in_array($role, ['manager', 'inventory_manager', 'inspector'], true);
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
