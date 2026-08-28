<?php

declare(strict_types=1);

namespace App\Modules\KYC\Application\Services;

use App\Modules\KYC\Application\DTOs\KycStatusDTO;
use App\Modules\KYC\Domain\Contracts\KycContract;
use App\Modules\KYC\Domain\Enums\KycStatus;
use App\Modules\KYC\Domain\Exceptions\KycDocumentAccessDeniedException;
use App\Modules\KYC\Infrastructure\Repositories\KycRepository;
use Illuminate\Contracts\Filesystem\Factory as FilesystemFactory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use InvalidArgumentException;

class KYCService implements KycContract
{
    public function __construct(
        private readonly KycRepository $kyc,
        private readonly FilesystemFactory $files,
    ) {}

    public function isUserVerified(int $userId): bool
    {
        return $this->kyc->isVerified($userId);
    }

    public function getStatus(int $userId): KycStatusDTO
    {
        $verification = $this->kyc->findVerification($userId);

        if ($verification === null) {
            return new KycStatusDTO(
                userId: $userId,
                isVerified: false,
                status: KycStatus::Pending->value,
            );
        }

        return new KycStatusDTO(
            userId: $userId,
            isVerified: $verification['status'] === KycStatus::Approved->value,
            status: $verification['status'],
            documentType: $verification['document_type'] ?? null,
            rejectionReason: $verification['rejection_reason'] ?? null,
        );
    }

    public function submitDocument(int $userId, string $documentType, UploadedFile $frontFile, ?UploadedFile $backFile = null): KycStatusDTO
    {
        $allowedMimes = (array) config('kyc.allowed_mimes', []);
        $maxSizeKb = (int) config('kyc.max_file_size_kb', 5120);

        $this->assertValidDocument($frontFile, $allowedMimes, $maxSizeKb);

        if ($backFile !== null) {
            $this->assertValidDocument($backFile, $allowedMimes, $maxSizeKb);
        }

        $disk = 'kyc_private';
        $directory = sprintf('users/%d/%s', $userId, $documentType);

        $frontPath = $frontFile->storeAs($directory, $this->randomizedFilename($frontFile), ['disk' => $disk]);
        $backPath = $backFile !== null
            ? $backFile->storeAs($directory, $this->randomizedFilename($backFile), ['disk' => $disk])
            : null;

        if ($frontPath === false) {
            throw new InvalidArgumentException('Unable to store the KYC document.');
        }

        $this->kyc->storeDocument($userId, $documentType, $frontPath, $backPath);

        return new KycStatusDTO(
            userId: $userId,
            isVerified: false,
            status: KycStatus::Pending->value,
            documentType: $documentType,
        );
    }

    public function getPrivateDocumentStream(int $userId, string $documentType)
    {
        if (! $this->kyc->isVerified($userId)) {
            throw KycDocumentAccessDeniedException::forUser($userId);
        }

        $path = $this->kyc->findDocumentPath($userId, $documentType);

        if ($path === null) {
            throw KycDocumentAccessDeniedException::forUser($userId);
        }

        $disk = 'kyc_private';
        $stream = $this->files->disk($disk)->readStream($path);

        if ($stream === null) {
            throw KycDocumentAccessDeniedException::forUser($userId);
        }

        return $stream;
    }

    private function assertValidDocument(UploadedFile $file, array $allowedMimes, int $maxSizeKb): void
    {
        if (! in_array($file->getMimeType(), $allowedMimes, true)) {
            throw new InvalidArgumentException(sprintf('Document MIME type "%s" is not allowed.', $file->getMimeType()));
        }

        if ($file->getSize() > $maxSizeKb * 1024) {
            throw new InvalidArgumentException(sprintf('Document exceeds the %d KB size limit.', $maxSizeKb));
        }
    }

    private function randomizedFilename(UploadedFile $file): string
    {
        $extension = match ($file->getMimeType()) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'application/pdf' => 'pdf',
            default => 'bin',
        };

        return Str::uuid()->toString().'.'.$extension;
    }
}
