<?php

declare(strict_types=1);

namespace App\Modules\KYC\Domain\Policies;

use App\Modules\Identity\Domain\Entities\User;
use App\Modules\KYC\Domain\Entities\KycVerification;

class KycPolicy
{
    public function view(User $user, KycVerification $kyc): bool
    {
        return $user->isSuperadmin() || $kyc->user_id === $user->id;
    }

    public function review(User $user, KycVerification $kyc): bool
    {
        return $user->isSuperadmin();
    }
}
