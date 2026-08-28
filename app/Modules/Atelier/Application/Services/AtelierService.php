<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Application\Services;

use App\Modules\Atelier\Application\DTOs\AtelierScopeDTO;
use App\Modules\Atelier\Domain\Contracts\AtelierAccess;
use App\Modules\Atelier\Domain\Contracts\AtelierReader;
use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Domain\Exceptions\AtelierAccessDeniedException;
use App\Modules\Atelier\Infrastructure\Repositories\AtelierRepository;

class AtelierService implements AtelierAccess, AtelierReader
{
    public function __construct(private readonly AtelierRepository $repository) {}

    public function resolveApprovedAtelier(int $atelierId): AtelierScopeDTO
    {
        $atelier = $this->repository->findById($atelierId);

        if ($atelier === null || ! $atelier->isApproved()) {
            throw new AtelierAccessDeniedException(sprintf('Atelier #%d is not available.', $atelierId));
        }

        return $this->toScopeDTO($atelier);
    }

    public function findForOwner(int $userId): ?AtelierScopeDTO
    {
        $atelier = $this->repository->findForOwner($userId);

        return $atelier === null ? null : $this->toScopeDTO($atelier);
    }

    public function isStaff(int $atelierId, int $userId): bool
    {
        return $this->repository->staffRoleFor($atelierId, $userId) !== null;
    }

    public function staffRoleFor(int $atelierId, int $userId): ?string
    {
        return $this->repository->staffRoleFor($atelierId, $userId);
    }

    public function authorizeManagement(int $atelierId, int $userId, ?string $requiredStaffRole = null): AtelierScopeDTO
    {
        $atelier = $this->repository->findById($atelierId);

        if ($atelier === null) {
            throw AtelierAccessDeniedException::forUser($atelierId, $userId);
        }

        if ((int) $atelier->owner_user_id === $userId) {
            return $this->toScopeDTO($atelier);
        }

        $staffRole = $this->repository->staffRoleFor($atelierId, $userId);

        if ($staffRole === null || ($requiredStaffRole !== null && $staffRole !== $requiredStaffRole)) {
            throw AtelierAccessDeniedException::forUser($atelierId, $userId);
        }

        return $this->toScopeDTO($atelier, $staffRole);
    }

    private function toScopeDTO(Atelier $atelier, ?string $staffRole = null): AtelierScopeDTO
    {
        return new AtelierScopeDTO(
            atelierId: $atelier->id,
            businessName: $atelier->business_name,
            slug: $atelier->slug,
            isActive: (bool) $atelier->is_active,
            isApproved: (bool) $atelier->is_approved,
            staffRole: $staffRole,
            commissionRate: (float) $atelier->commission_rate,
        );
    }
}
