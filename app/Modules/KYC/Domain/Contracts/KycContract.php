<?php

declare(strict_types=1);

namespace App\Modules\KYC\Domain\Contracts;

use App\Modules\KYC\Application\DTOs\KycStatusDTO;
use Illuminate\Http\UploadedFile;

/**
 * Public contract for the KYC module.
 *
 * KYC documents are sensitive: they live in private storage, are access
 * controlled, and their paths are never exposed to the client.
 */
interface KycContract
{
    public function isUserVerified(int $userId): bool;

    public function getStatus(int $userId): KycStatusDTO;

    /**
     * Submits an identity document for verification. Returns the new status.
     */
    public function submitDocument(int $userId, string $documentType, UploadedFile $frontFile, ?UploadedFile $backFile = null): KycStatusDTO;

    /**
     * Returns an authorized, expiring stream for a verified user's own
     * document. Throws KycDocumentAccessDeniedException otherwise.
     *
     * @return resource
     */
    public function getPrivateDocumentStream(int $userId, string $documentType);
}
