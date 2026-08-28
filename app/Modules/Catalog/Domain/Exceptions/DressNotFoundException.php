<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Domain\Exceptions;

use RuntimeException;

class DressNotFoundException extends RuntimeException
{
    public static function forDress(int $dressId): self
    {
        return new self(sprintf('Dress #%d was not found.', $dressId));
    }

    public static function forSlug(string $slug): self
    {
        return new self(sprintf('Dress "%s" was not found or is not published.', $slug));
    }
}
