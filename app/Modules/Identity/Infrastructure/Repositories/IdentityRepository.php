<?php

declare(strict_types=1);

namespace App\Modules\Identity\Infrastructure\Repositories;

use App\Modules\Identity\Domain\Entities\User;

/**
 * Identity persistence port.
 */
interface IdentityRepository
{
    public function findUser(int $userId): ?User;

    /**
     * @return list<string>
     */
    public function roleSlugsForUser(int $userId): array;

    /**
     * @return list<string>
     */
    public function permissionSlugsForUser(int $userId): array;

    public function userHasRole(int $userId, string $role): bool;
}
