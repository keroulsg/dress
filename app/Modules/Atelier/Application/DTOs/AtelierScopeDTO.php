<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Application\DTOs;

/**
 * Immutable snapshot of an atelier and the acting user's scope within it.
 */
final readonly class AtelierScopeDTO
{
    public function __construct(
        public int $atelierId,
        public string $businessName,
        public string $slug,
        public bool $isActive,
        public bool $isApproved,
        public ?string $staffRole = null,
        public float|int|string $commissionRate = 0,
    ) {}
}
