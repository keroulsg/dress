<?php

declare(strict_types=1);

namespace App\Modules\KYC\Infrastructure\Observers;

use App\Modules\Administration\Domain\Contracts\AuditWriter;
use App\Modules\KYC\Domain\Entities\KycVerification;

class KycVerificationObserver
{
    public function __construct(private readonly AuditWriter $audit) {}

    public function updated(KycVerification $kyc): void
    {
        if (! $kyc->wasChanged('status')) {
            return;
        }

        $this->audit->record(
            actorId: $kyc->reviewed_by ?? $kyc->user_id,
            action: 'kyc.status_changed',
            auditableType: $kyc->getMorphClass(),
            auditableId: $kyc->id,
            oldValues: ['status' => $kyc->getOriginal('status')],
            newValues: ['status' => $kyc->status],
        );
    }
}
