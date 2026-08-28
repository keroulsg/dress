<?php

declare(strict_types=1);

namespace App\Modules\Administration\Infrastructure\Repositories;

use App\Modules\Administration\Domain\Entities\AuditLog;

class EloquentAuditRepository implements AuditRepository
{
    public function __construct(
        private readonly AuditLog $auditLog,
    ) {}

    public function record(array $attributes): void
    {
        $this->auditLog->create($attributes);
    }
}
