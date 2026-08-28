<?php

declare(strict_types=1);

namespace App\Modules\Identity\Application\DTOs;

/**
 * Immutable snapshot of a user's identity and authorization context.
 *
 * @param  list<string>  $roles
 * @param  list<string>  $permissions
 */
final readonly class UserIdentityDTO
{
    public function __construct(
        public int $userId,
        public string $name,
        public string $email,
        public array $roles,
        public array $permissions,
        public bool $isVerified,
    ) {}
}
