<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Infrastructure\Observers;

use App\Modules\Administration\Domain\Contracts\AuditWriter;
use App\Modules\Atelier\Domain\Entities\Atelier;

class AtelierObserver
{
    public function __construct(private readonly AuditWriter $audit) {}

    public function updated(Atelier $atelier): void
    {
        if ($atelier->wasChanged('approved_at')) {
            $this->audit->record(
                actorId: $atelier->approved_by,
                action: $atelier->approved_at !== null ? 'atelier.approved' : 'atelier.approval_revoked',
                auditableType: $atelier->getMorphClass(),
                auditableId: $atelier->id,
                oldValues: ['approved_at' => $atelier->getOriginal('approved_at')],
                newValues: ['approved_at' => $atelier->approved_at],
            );
        }

        if ($atelier->wasChanged('is_active')) {
            $this->audit->record(
                actorId: $atelier->approved_by,
                action: (bool) $atelier->is_active ? 'atelier.activated' : 'atelier.suspended',
                auditableType: $atelier->getMorphClass(),
                auditableId: $atelier->id,
                oldValues: ['is_active' => $atelier->getOriginal('is_active')],
                newValues: ['is_active' => $atelier->is_active],
            );
        }
    }
}
