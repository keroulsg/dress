<?php

declare(strict_types=1);

namespace App\Modules\KYC\Infrastructure\Repositories;

interface KycRepository
{
    public function findVerification(int $userId): ?array;

    public function isVerified(int $userId): bool;

    public function storeDocument(int $userId, string $documentType, string $frontPath, ?string $backPath): int;

    public function findDocumentPath(int $userId, string $documentType): ?string;
}
