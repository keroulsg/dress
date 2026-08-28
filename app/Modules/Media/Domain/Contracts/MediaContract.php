<?php

declare(strict_types=1);

namespace App\Modules\Media\Domain\Contracts;

use App\Modules\Media\Application\DTOs\StoredAssetDTO;

/**
 * Public contract for the Media module.
 *
 * Media owns upload validation, transformations, references, and the
 * private/public storage policy. Never trust file extensions; MIME content is
 * verified server-side.
 */
interface MediaContract
{
    /**
     * @param  array{tmp_name?: string, actor_id?: int|null, owner_type?: string|null, owner_id?: int|null}  $file
     */
    public function storePublic(array $file, string $purpose, array $options = []): StoredAssetDTO;

    /**
     * @param  array{tmp_name?: string, actor_id?: int|null, owner_type?: string|null, owner_id?: int|null}  $file
     */
    public function storePrivate(array $file, string $purpose, array $options = []): StoredAssetDTO;

    /**
     * Stores a garment photo as an optimized WebP with `thumb_` and `medium_`
     * responsive variants. Path: dresses/{atelier_id}/{year}/{uuid}.webp.
     *
     * @param  array{tmp_name?: string, atelier_id?: int, dress_id?: int|null, actor_id?: int|null, alt?: string|null}  $file
     */
    public function storeOptimizedImage(array $file, array $options = []): StoredAssetDTO;

    /**
     * Returns an authorized, expiring stream for a private asset.
     *
     * @return resource
     */
    public function getPrivateStream(int $assetId, int $actorId);

    public function delete(int $assetId, int $actorId): void;
}
