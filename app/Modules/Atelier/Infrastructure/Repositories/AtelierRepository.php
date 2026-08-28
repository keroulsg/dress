<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Infrastructure\Repositories;

use App\Modules\Atelier\Domain\Entities\Atelier;

interface AtelierRepository
{
    public function findById(int $atelierId): ?Atelier;

    public function findForOwner(int $userId): ?Atelier;

    public function staffRoleFor(int $atelierId, int $userId): ?string;
}
