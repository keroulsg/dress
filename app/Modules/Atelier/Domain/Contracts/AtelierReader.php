<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Domain\Contracts;

use App\Modules\Atelier\Application\DTOs\AtelierScopeDTO;

/**
 * Public read contract for the Atelier module.
 */
interface AtelierReader
{
    public function resolveApprovedAtelier(int $atelierId): AtelierScopeDTO;

    public function findForOwner(int $userId): ?AtelierScopeDTO;

    public function isStaff(int $atelierId, int $userId): bool;

    public function staffRoleFor(int $atelierId, int $userId): ?string;
}
