<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\Contracts;

use App\Modules\Identity\Application\DTOs\UserIdentityDTO;

/**
 * Public read contract for the Identity module.
 *
 * Identity owns users, credentials, roles, and permissions. Other modules read
 * identity snapshots through this contract; they never query the users table
 * directly.
 */
interface IdentityReader
{
    public function getUserIdentity(int $userId): UserIdentityDTO;

    /**
     * @return list<string>
     */
    public function getPermissionSlugs(int $userId): array;

    public function hasRole(int $userId, string $role): bool;
}
