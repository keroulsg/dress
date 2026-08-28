<?php

declare(strict_types=1);

namespace App\Modules\Administration\Application\Services;

use App\Modules\Administration\Domain\Contracts\AuditWriter;
use App\Modules\Administration\Infrastructure\Repositories\AuditRepository;

/**
 * Append-only audit writer. Sensitive actions record a row that is never
 * updated or deleted through normal application flows.
 */
class AuditLoggerService implements AuditWriter
{
    public function __construct(
        private readonly AuditRepository $audit,
    ) {}

    public function record(
        int|string|null $actorId,
        string $action,
        string $auditableType,
        int|string|null $auditableId,
        array $oldValues = [],
        array $newValues = [],
    ): void {
        $this->audit->record([
            'user_id' => $actorId,
            'action' => $action,
            'auditable_type' => $auditableType,
            'auditable_id' => $auditableId,
            'old_values_json' => $oldValues === [] ? null : json_encode($oldValues),
            'new_values_json' => $newValues === [] ? null : json_encode($newValues),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
