<?php

declare(strict_types=1);

namespace App\Modules\Identity\Infrastructure\Observers;

use App\Modules\Administration\Domain\Contracts\AuditWriter;
use App\Modules\Identity\Domain\Entities\User;

class UserObserver
{
    public function __construct(private readonly AuditWriter $audit) {}

    public function updated(User $user): void
    {
        if (! $user->wasChanged('role')) {
            return;
        }

        $this->audit->record(
            actorId: $user->id,
            action: 'identity.role_changed',
            auditableType: $user->getMorphClass(),
            auditableId: $user->id,
            oldValues: ['role' => $user->getOriginal('role')],
            newValues: ['role' => $user->role],
        );
    }
}
