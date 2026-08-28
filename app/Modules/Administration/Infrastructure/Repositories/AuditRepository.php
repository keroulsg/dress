<?php

declare(strict_types=1);

namespace App\Modules\Administration\Infrastructure\Repositories;

interface AuditRepository
{
    public function record(array $attributes): void;
}
