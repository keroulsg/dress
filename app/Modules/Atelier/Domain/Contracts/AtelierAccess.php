<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Domain\Contracts;

use App\Modules\Atelier\Application\DTOs\AtelierScopeDTO;

/**
 * Authorization boundary for atelier-scoped operations.
 */
interface AtelierAccess
{
    /**
     * Verifies the user can manage the given atelier (owner, manager, or a
     * staff member with the requested grant). Throws AtelierAccessDeniedException.
     */
    public function authorizeManagement(int $atelierId, int $userId, ?string $requiredStaffRole = null): AtelierScopeDTO;
}
