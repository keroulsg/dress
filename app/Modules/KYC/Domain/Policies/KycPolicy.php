<?php

declare(strict_types=1);

namespace App\Modules\KYC\Domain\Policies;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\KYC\Domain\Entities\KycVerification;

class KycPolicy
{
    public function view(User $user, KycVerification $kyc): bool
    {
        if ($user->isSuperadmin() || $kyc->user_id === $user->id) {
            return true;
        }

        if ($user->role === 'atelier_owner') {
            $userAtelierIds = $user->ateliers()->pluck('id')->all();

            return Booking::query()
                ->where('renter_id', $kyc->user_id)
                ->whereIn('atelier_id', $userAtelierIds)
                ->exists();
        }

        return false;
    }

    public function review(User $user, KycVerification $kyc): bool
    {
        return $user->isSuperadmin();
    }
}
