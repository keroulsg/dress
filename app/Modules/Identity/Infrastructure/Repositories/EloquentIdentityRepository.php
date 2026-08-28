<?php

declare(strict_types=1);

namespace App\Modules\Identity\Infrastructure\Repositories;

use App\Modules\Identity\Domain\Entities\User;

/**
 * Role is a column on users; permissions are derived from the role through a
 * static registry so authorization never depends on join tables.
 */
class EloquentIdentityRepository implements IdentityRepository
{
    /** @var array<string, list<string>> */
    private const ROLE_PERMISSIONS = [
        'superadmin' => ['*'],
        'atelier_owner' => [
            'catalog.manage',
            'catalog.publish',
            'inventory.manage',
            'booking.manage',
            'booking.inspect',
            'finance.statements',
            'review.reply',
            'dispute.respond',
        ],
        'atelier_staff' => [
            'inventory.manage',
            'booking.manage',
            'booking.inspect',
        ],
        'renter' => [
            'booking.create',
            'booking.manage_own',
            'kyc.submit',
            'review.create',
            'dispute.open',
        ],
    ];

    public function findUser(int $userId): ?User
    {
        return User::query()->find($userId);
    }

    public function roleSlugsForUser(int $userId): array
    {
        $role = User::query()->whereKey($userId)->value('role');

        return $role === null ? [] : [(string) $role];
    }

    public function permissionSlugsForUser(int $userId): array
    {
        $role = User::query()->whereKey($userId)->value('role');

        if ($role === null) {
            return [];
        }

        return self::ROLE_PERMISSIONS[(string) $role] ?? [];
    }

    public function userHasRole(int $userId, string $role): bool
    {
        return User::query()
            ->whereKey($userId)
            ->where('role', $role)
            ->exists();
    }
}
