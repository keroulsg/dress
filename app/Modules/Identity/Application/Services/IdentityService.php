<?php

declare(strict_types=1);

namespace App\Modules\Identity\Application\Services;

use App\Modules\Identity\Application\DTOs\UserIdentityDTO;
use App\Modules\Identity\Domain\Contracts\IdentityReader;
use App\Modules\Identity\Domain\Exceptions\IdentityNotFoundException;
use App\Modules\Identity\Infrastructure\Repositories\IdentityRepository;

class IdentityService implements IdentityReader
{
    public function __construct(private readonly IdentityRepository $repository) {}

    public function getUserIdentity(int $userId): UserIdentityDTO
    {
        $user = $this->repository->findUser($userId);

        if ($user === null) {
            throw IdentityNotFoundException::forUser($userId);
        }

        return new UserIdentityDTO(
            userId: $user->id,
            name: $user->name,
            email: $user->email,
            roles: $this->repository->roleSlugsForUser($userId),
            permissions: $this->repository->permissionSlugsForUser($userId),
            isVerified: $user->email_verified_at !== null,
        );
    }

    public function getPermissionSlugs(int $userId): array
    {
        return $this->repository->permissionSlugsForUser($userId);
    }

    public function hasRole(int $userId, string $role): bool
    {
        return $this->repository->userHasRole($userId, $role);
    }
}
