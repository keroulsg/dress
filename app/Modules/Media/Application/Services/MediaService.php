<?php

declare(strict_types=1);

namespace App\Modules\Media\Application\Services;

use App\Modules\Media\Application\DTOs\StoredAssetDTO;
use App\Modules\Media\Domain\Contracts\MediaContract;
use App\Modules\Media\Domain\Exceptions\InvalidMediaException;
use App\Modules\Media\Infrastructure\Repositories\MediaRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService implements MediaContract
{
    /**
     * @var array<string, string>
     */
    private const MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
    ];

    private const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

    private const MEDIUM_WIDTH = 800;

    private const THUMB_WIDTH = 480;

    public function __construct(private readonly MediaRepository $repository) {}

    public function storePublic(array $file, string $purpose, array $options = []): StoredAssetDTO
    {
        return $this->store($file, $purpose, (string) config('media.public_disk'), true, $options);
    }

    public function storePrivate(array $file, string $purpose, array $options = []): StoredAssetDTO
    {
        return $this->store($file, $purpose, (string) config('media.private_disk'), false, $options);
    }

    public function storeOptimizedImage(array $file, array $options = []): StoredAssetDTO
    {
        $options = [...$file, ...$options];

        $tmpPath = $this->requireTmpPath($options);

        if (! function_exists('imagecreatefromwebp')) {
            throw InvalidMediaException::gdUnavailable();
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($tmpPath);

        if (! in_array($mime, self::IMAGE_MIMES, true)) {
            throw InvalidMediaException::unsupportedMime((string) $mime);
        }

        $source = $this->decodeImage($tmpPath, $mime);

        if ($source === null) {
            throw InvalidMediaException::invalidImage();
        }

        $atelierId = (int) ($options['atelier_id'] ?? 0);
        $directory = $options['directory'] ?? sprintf('dresses/%d/%d', $atelierId, (int) date('Y'));
        $base = Str::uuid()->toString();

        $disk = Storage::disk((string) config('media.public_disk'));

        $primary = sprintf('%s/%s.webp', $directory, $base);
        $medium = sprintf('%s/medium_%s.webp', $directory, $base);
        $thumb = sprintf('%s/thumb_%s.webp', $directory, $base);

        $this->encodeWebp($source, $disk, $primary, null);
        $this->encodeWebp($source, $disk, $medium, self::MEDIUM_WIDTH);
        $this->encodeWebp($source, $disk, $thumb, self::THUMB_WIDTH);

        imagedestroy($source);

        $size = (int) $disk->size($primary);
        $asset = $this->repository->create([
            'purpose' => $options['purpose'] ?? 'dress_image',
            'disk' => (string) config('media.public_disk'),
            'path' => $primary,
            'thumbnail_path' => $thumb,
            'mime_type' => 'image/webp',
            'size' => $size,
            'owner_type' => $options['owner_type'] ?? null,
            'owner_id' => $options['dress_id'] ?? null,
        ]);

        return new StoredAssetDTO(
            assetId: $asset->id,
            purpose: $options['purpose'] ?? 'dress_image',
            disk: (string) config('media.public_disk'),
            path: $primary,
            publicUrl: $disk->url($primary),
            thumbnailPath: $thumb,
            mimeType: 'image/webp',
            size: $size,
        );
    }

    /**
     * @return resource
     */
    public function getPrivateStream(int $assetId, int $actorId)
    {
        $asset = $this->repository->find($assetId);

        if ($asset === null) {
            throw InvalidMediaException::assetNotFound($assetId);
        }

        if (! $asset->isPrivate()) {
            throw InvalidMediaException::notPrivate($assetId);
        }

        if ($asset->owner_type !== null && $asset->owner_id !== null && (int) $asset->owner_id !== $actorId) {
            throw new AuthorizationException(sprintf('User #%d cannot access media asset #%d.', $actorId, $assetId));
        }

        $disk = Storage::disk($asset->disk);

        if (! $disk->exists($asset->path)) {
            throw InvalidMediaException::missingOnDisk($assetId);
        }

        $stream = $disk->readStream($asset->path);

        if ($stream === false) {
            throw InvalidMediaException::missingOnDisk($assetId);
        }

        return $stream;
    }

    public function delete(int $assetId, int $actorId): void
    {
        $asset = $this->repository->find($assetId);

        if ($asset === null) {
            throw InvalidMediaException::assetNotFound($assetId);
        }

        $disk = Storage::disk($asset->disk);

        foreach ([$asset->path, $asset->thumbnail_path] as $path) {
            if ($path !== null && $disk->exists($path)) {
                $disk->delete($path);
            }
        }

        $this->repository->delete($assetId);
    }

    private function store(array $file, string $purpose, string $diskName, bool $isPublic, array $options): StoredAssetDTO
    {
        $tmpPath = $this->requireTmpPath($file);
        $size = (int) filesize($tmpPath);

        if ($size > (int) config('media.max_file_size_kb') * 1024) {
            throw InvalidMediaException::fileTooLarge($size);
        }

        $mime = (string) (new \finfo(FILEINFO_MIME_TYPE))->file($tmpPath);

        if (! in_array($mime, (array) config('media.allowed_mimes'), true)) {
            throw InvalidMediaException::unsupportedMime($mime);
        }

        $extension = self::MIME_EXTENSIONS[$mime] ?? 'bin';
        $filename = Str::random(40).'.'.$extension;
        $directory = Str::slug($purpose) ?: 'general';

        $disk = Storage::disk($diskName);
        $path = $disk->putFileAs($directory, $tmpPath, $filename);

        if ($path === false) {
            throw InvalidMediaException::storageFailure();
        }

        $asset = $this->repository->create([
            'purpose' => $purpose,
            'disk' => $diskName,
            'path' => $path,
            'thumbnail_path' => null,
            'mime_type' => $mime,
            'size' => $size,
            'owner_type' => $options['owner_type'] ?? null,
            'owner_id' => $options['owner_id'] ?? null,
        ]);

        return new StoredAssetDTO(
            assetId: $asset->id,
            purpose: $purpose,
            disk: $diskName,
            path: $path,
            publicUrl: $isPublic ? $disk->url($path) : null,
            mimeType: $mime,
            size: $size,
        );
    }

    private function requireTmpPath(array $file): string
    {
        $tmpPath = $file['tmp_name'] ?? null;

        if ($tmpPath === null || ! is_file($tmpPath)) {
            throw InvalidMediaException::invalidUpload();
        }

        return $tmpPath;
    }

    /**
     * @return \GdImage|null
     */
    private function decodeImage(string $tmpPath, string $mime)
    {
        return match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($tmpPath) ?: null,
            'image/png' => @imagecreatefrompng($tmpPath) ?: null,
            'image/webp' => @imagecreatefromwebp($tmpPath) ?: null,
            default => null,
        };
    }

    private function encodeWebp(\GdImage $source, $disk, string $path, ?int $maxWidth): void
    {
        $width = imagesx($source);
        $height = imagesy($source);
        $dest = $source;

        if ($maxWidth !== null && $width > $maxWidth) {
            $ratio = $maxWidth / $width;
            $destWidth = $maxWidth;
            $destHeight = (int) round($height * $ratio);
            $dest = imagecreatetruecolor($destWidth, $destHeight);
            imagecopyresampled($dest, $source, 0, 0, 0, 0, $destWidth, $destHeight, $width, $height);
        }

        $buffer = $this->captureWebp($dest);

        if ($dest !== $source) {
            imagedestroy($dest);
        }

        if ($buffer === null) {
            throw InvalidMediaException::encodingFailed($path);
        }

        $disk->put($path, $buffer, 'public');
    }

    private function captureWebp(\GdImage $image): ?string
    {
        ob_start();
        $result = imagewebp($image, null, 82);
        $buffer = ob_get_clean();

        return $result === true && is_string($buffer) ? $buffer : null;
    }
}
