<?php

declare(strict_types=1);

namespace App\Modules\KYC\Domain\Enums;

enum KycStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Expired = 'expired';

    public function isVerified(): bool
    {
        return $this === self::Approved;
    }
}
