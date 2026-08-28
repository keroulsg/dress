<?php

declare(strict_types=1);

namespace App\Modules\KYC\Application\DTOs;

/**
 * Immutable snapshot of a user's KYC verification state.
 */
final readonly class KycStatusDTO
{
    public function __construct(
        public int $userId,
        public bool $isVerified,
        public string $status,
        public ?string $documentType = null,
        public ?string $rejectionReason = null,
    ) {}
}
