<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Infrastructure\Repositories;

use App\Modules\Catalog\Application\DTOs\DressFilterDTO;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CatalogRepository
{
    public function findDress(int $dressId): ?Dress;

    public function findBySlug(string $slug): ?Dress;

    public function isPublished(int $dressId): ?bool;

    /**
     * @return list<int>
     */
    public function publishedDressIds(int $atelierId, int $perPage, int $page): array;

    public function createDress(array $data, int $atelierId): Dress;

    public function updateDress(int $dressId, array $data): bool;

    public function publishDress(int $dressId): void;

    public function archiveDress(int $dressId): void;

    public function deleteDress(int $dressId): void;

    public function paginatePublished(DressFilterDTO $filter): LengthAwarePaginator;

    /**
     * @return array<string, mixed>
     */
    public function facetCounts(DressFilterDTO $filter): array;

    public function paginateAtelierDresses(int $atelierId, ?string $status, int $perPage, int $page): LengthAwarePaginator;

    /**
     * @return list<Category>
     */
    public function categoriesForFilters(): array;

    /**
     * @param  list<array{size_code: string, bust?: float|string|null, waist?: float|string|null, hips?: float|string|null, length?: float|string|null, is_available?: bool}>  $sizes
     */
    public function syncSizes(int $dressId, array $sizes): void;

    /**
     * @param  list<array{image_path: string, thumbnail_path: string|null, display_order: int, is_primary: bool, alt_text: string|null}>  $imageData
     */
    public function syncImages(int $dressId, array $imageData): void;

    /**
     * @param  list<int>  $imageOrderIds
     */
    public function reorderImages(int $dressId, array $imageOrderIds): void;
}
