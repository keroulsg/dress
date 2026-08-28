<?php

declare(strict_types=1);

namespace App\Modules\KYC\Infrastructure\Repositories;

use App\Modules\KYC\Domain\Entities\KycVerification;

class EloquentKycRepository implements KycRepository
{
    public function __construct(
        private readonly KycVerification $verification,
    ) {}

    public function findVerification(int $userId): ?array
    {
        return $this->verification->where('user_id', $userId)->latest('id')->first()?->toArray();
    }

    public function isVerified(int $userId): bool
    {
        return $this->verification
            ->where('user_id', $userId)
            ->where('status', 'approved')
            ->exists();
    }

    public function storeDocument(int $userId, string $documentType, string $frontPath, ?string $backPath): int
    {
        return $this->verification->create([
            'user_id' => $userId,
            'document_type' => $documentType,
            'front_path' => $frontPath,
            'back_path' => $backPath,
            'status' => 'pending',
        ])->id;
    }

    public function findDocumentPath(int $userId, string $documentType): ?string
    {
        return $this->verification
            ->where('user_id', $userId)
            ->where('document_type', $documentType)
            ->latest('id')
            ->value('front_path');
    }
}
