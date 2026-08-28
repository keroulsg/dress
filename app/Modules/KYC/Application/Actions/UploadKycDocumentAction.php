<?php

declare(strict_types=1);

namespace App\Modules\KYC\Application\Actions;

use App\Modules\KYC\Application\DTOs\KycStatusDTO;
use App\Modules\KYC\Application\Services\KYCService;
use Illuminate\Http\UploadedFile;
use InvalidArgumentException;

/**
 * Uploads an identity document to the private KYC disk.
 *
 * Client filenames are discarded entirely; storage uses randomized UUID
 * filenames with the extension derived from the detected MIME type.
 */
class UploadKycDocumentAction
{
    public function __construct(private readonly KYCService $kyc) {}

    public function handle(int $userId, string $documentType, UploadedFile $frontFile, ?UploadedFile $backFile = null): KycStatusDTO
    {
        if (! in_array($documentType, (array) config('kyc.document_types', []), true)) {
            throw new InvalidArgumentException(sprintf('Document type "%s" is not supported.', $documentType));
        }

        return $this->kyc->submitDocument($userId, $documentType, $frontFile, $backFile);
    }
}
