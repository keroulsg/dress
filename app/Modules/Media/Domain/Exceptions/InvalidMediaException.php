<?php

declare(strict_types=1);

namespace App\Modules\Media\Domain\Exceptions;

use RuntimeException;

class InvalidMediaException extends RuntimeException
{
    public static function invalidUpload(): self
    {
        return new self('The uploaded file is missing or unreadable.');
    }

    public static function unsupportedMime(string $mime): self
    {
        return new self(sprintf('File type "%s" is not allowed.', $mime));
    }

    public static function fileTooLarge(int $size): self
    {
        return new self(sprintf('File size %d bytes exceeds the allowed limit.', $size));
    }

    public static function storageFailure(): self
    {
        return new self('The media asset could not be persisted to storage.');
    }

    public static function assetNotFound(int $assetId): self
    {
        return new self(sprintf('Media asset #%d was not found.', $assetId));
    }

    public static function notPrivate(int $assetId): self
    {
        return new self(sprintf('Media asset #%d is not private.', $assetId));
    }

    public static function missingOnDisk(int $assetId): self
    {
        return new self(sprintf('Media asset #%d is missing from storage.', $assetId));
    }

    public static function gdUnavailable(): self
    {
        return new self('Image processing is unavailable on this server (GD missing).');
    }

    public static function invalidImage(): self
    {
        return new self('The uploaded file is not a valid image.');
    }

    public static function encodingFailed(string $path): self
    {
        return new self(sprintf('The image could not be encoded to WebP at "%s".', $path));
    }
}
