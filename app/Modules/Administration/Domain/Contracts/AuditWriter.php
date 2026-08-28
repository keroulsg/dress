<?php

declare(strict_types=1);

namespace App\Modules\Administration\Domain\Contracts;

/**
 * Append-only audit writer owned by the Administration module.
 *
 * Audit logs are never updated or deleted through normal application flows.
 * Every financially meaningful or security-relevant action writes a record.
 */
interface AuditWriter
{
    public function record(
        int|string|null $actorId,
        string $action,
        string $auditableType,
        int|string|null $auditableId,
        array $oldValues = [],
        array $newValues = [],
    ): void;
}
