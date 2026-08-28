<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Domain\Contracts;

use App\Modules\Catalog\Application\DTOs\DressDetailResourceDTO;
use App\Modules\Catalog\Application\DTOs\DressFilterDTO;
use App\Modules\Catalog\Application\DTOs\DressSnapshotDTO;

/**
 * Public read contract for the Catalog module.
 */
interface CatalogReader
{
    public function getDressSnapshot(int $dressId): DressSnapshotDTO;

    public function isDressPublished(int $dressId): bool;

    public function getPublishedDressIds(int $atelierId = 0, int $perPage = 24, int $page = 1): array;

    /**
     * Faceted storefront search.
     *
     * @return array{dresses: list<array<string, mixed>>, facets: array<string, mixed>, pagination: array<string, mixed>}
     */
    public function searchCatalog(DressFilterDTO $filter): array;

    public function getDressDetail(string $slug): DressDetailResourceDTO;

    /**
     * @return list<array{id: int, name: string}>
     */
    public function getActiveCategories(): array;

    /**
     * @return array{dresses: list<array<string, mixed>>, pagination: array<string, mixed>}
     */
    public function listAtelierDresses(int $atelierId, ?string $status, int $perPage = 12, int $page = 1): array;
}
