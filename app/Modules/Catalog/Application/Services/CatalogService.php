<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Application\Services;

use App\Modules\Catalog\Application\DTOs\CreateDressDTO;
use App\Modules\Catalog\Application\DTOs\DressCardResourceDTO;
use App\Modules\Catalog\Application\DTOs\DressDetailResourceDTO;
use App\Modules\Catalog\Application\DTOs\DressFilterDTO;
use App\Modules\Catalog\Application\DTOs\DressSnapshotDTO;
use App\Modules\Catalog\Application\DTOs\UpdateDressDTO;
use App\Modules\Catalog\Domain\Contracts\CatalogReader;
use App\Modules\Catalog\Domain\Contracts\DressManagementContract;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Exceptions\DressNotFoundException;
use App\Modules\Catalog\Infrastructure\Repositories\CatalogRepository;
use App\Modules\Media\Application\DTOs\StoredAssetDTO;
use App\Modules\Media\Domain\Contracts\MediaContract;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use App\Modules\Review\Domain\Entities\Review;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class CatalogService implements CatalogReader, DressManagementContract
{
    private const CURRENCY = 'EGP';

    public function __construct(
        private readonly CatalogRepository $repository,
        private readonly MediaContract $media,
    ) {}

    public function getDressSnapshot(int $dressId): DressSnapshotDTO
    {
        $dress = $this->repository->findDress($dressId);

        if ($dress === null) {
            throw DressNotFoundException::forDress($dressId);
        }

        $primaryImage = $dress->images->firstWhere('is_primary', true) ?? $dress->images->first();

        return new DressSnapshotDTO(
            dressId: $dress->id,
            atelierId: $dress->atelier_id,
            title: $dress->title,
            slug: $dress->slug,
            status: $dress->status,
            rentalPricePerDay: Money::fromDecimal($dress->rental_price_per_day, self::CURRENCY),
            securityDepositAmount: Money::fromDecimal($dress->security_deposit_amount, self::CURRENCY),
            cleaningFee: Money::fromDecimal($dress->cleaning_fee, self::CURRENCY),
            lateFeePerDay: Money::fromDecimal($dress->late_fee_per_day, self::CURRENCY),
            turnaroundBufferDays: (int) $dress->turnaround_buffer_days,
            availableSizes: $dress->sizes->where('is_available', true)->pluck('size_code')->sort()->values()->all(),
            primaryImagePath: $primaryImage?->image_path,
        );
    }

    public function isDressPublished(int $dressId): bool
    {
        return $this->repository->isPublished($dressId) ?? false;
    }

    public function getPublishedDressIds(int $atelierId = 0, int $perPage = 24, int $page = 1): array
    {
        return $this->repository->publishedDressIds($atelierId, $perPage, $page);
    }

    public function searchCatalog(DressFilterDTO $filter): array
    {
        $paginator = $this->repository->paginatePublished($filter);

        $dresses = array_map(
            fn (Dress $dress): array => $this->toCardDTO($dress)->toArray(),
            $paginator->items(),
        );

        return [
            'dresses' => array_values($dresses),
            'facets' => $this->repository->facetCounts($filter),
            'pagination' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ];
    }

    public function getDressDetail(string $slug): DressDetailResourceDTO
    {
        $dress = $this->repository->findBySlug($slug);

        if ($dress === null || $dress->status !== 'active' || $dress->published_at === null) {
            throw DressNotFoundException::forSlug($slug);
        }

        $primary = $dress->images->firstWhere('is_primary', true);

        $images = $dress->images
            ->sortBy('display_order')
            ->map(fn ($image): array => [
                'id' => $image->id,
                'path' => $image->image_path,
                'thumbnail' => $image->thumbnail_path,
                'alt' => $image->alt_text,
                'is_primary' => (bool) $image->is_primary,
                'display_order' => (int) $image->display_order,
            ])
            ->values()
            ->all();

        $sizes = $dress->sizes
            ->sortBy('size_code')
            ->map(fn ($size): array => [
                'size_code' => $size->size_code,
                'bust' => $size->bust,
                'waist' => $size->waist,
                'hips' => $size->hips,
                'length' => $size->length,
                'is_available' => (bool) $size->is_available,
            ])
            ->values()
            ->all();

        $atelier = $dress->atelier;
        $owner = $atelier->owner;

        $reviewSummary = [
            'count' => Review::query()->where('dress_id', $dress->id)->count(),
            'average' => Review::query()->where('dress_id', $dress->id)->avg('rating'),
        ];

        return new DressDetailResourceDTO(
            id: $dress->id,
            slug: $dress->slug,
            title: $dress->title,
            description: $dress->description ?? '',
            fabricType: $dress->fabric_type ?? '',
            silhouette: $dress->silhouette ?? '',
            colorPrimary: $dress->color_primary ?? '',
            originalRetailValue: Money::fromDecimal($dress->original_retail_value, self::CURRENCY),
            rentalPricePerDay: Money::fromDecimal($dress->rental_price_per_day, self::CURRENCY),
            securityDepositAmount: Money::fromDecimal($dress->security_deposit_amount, self::CURRENCY),
            cleaningFee: Money::fromDecimal($dress->cleaning_fee, self::CURRENCY),
            lateFeePerDay: Money::fromDecimal($dress->late_fee_per_day, self::CURRENCY),
            turnaroundBufferDays: (int) $dress->turnaround_buffer_days,
            conditionRating: $dress->condition_rating ?? 'good',
            status: $dress->status,
            images: $images,
            sizes: $sizes,
            atelier: [
                'business_name' => $atelier->business_name,
                'city' => $atelier->city,
                'rating_average' => $owner?->rating_average,
                'is_approved' => $atelier->isApproved(),
            ],
            reviewSummary: $reviewSummary,
        );
    }

    public function getActiveCategories(): array
    {
        return array_map(
            fn ($category): array => ['id' => $category->id, 'name' => $category->name],
            $this->repository->categoriesForFilters(),
        );
    }

    public function listAtelierDresses(int $atelierId, ?string $status, int $perPage = 12, int $page = 1): array
    {
        $paginator = $this->repository->paginateAtelierDresses($atelierId, $status, $perPage, $page);

        $dresses = array_map(function (Dress $dress): array {
            $primary = $dress->images->firstWhere('is_primary', true) ?? $dress->images->first();

            return [
                'id' => $dress->id,
                'title' => $dress->title,
                'slug' => $dress->slug,
                'status' => $dress->status,
                'rental_price_per_day' => $dress->rental_price_per_day,
                'primary_image' => $primary?->thumbnail_path,
                'category' => $dress->category?->name,
                'updated_at' => $dress->updated_at?->toDateTimeString(),
            ];
        }, $paginator->items());

        return [
            'dresses' => array_values($dresses),
            'pagination' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ];
    }

    public function createDress(int $atelierId, CreateDressDTO $dto): Dress
    {
        $dress = $this->repository->createDress([
            'title' => $dto->title,
            'slug' => $this->uniqueSlug($dto->title),
            'sku' => 'DR-'.strtoupper(Str::random(8)),
            'category_id' => $dto->categoryId,
            'description' => $dto->description,
            'fabric_type' => $dto->fabricType,
            'silhouette' => $dto->silhouette,
            'color_primary' => $dto->colorPrimary,
            'original_retail_value' => $dto->originalRetailValue,
            'rental_price_per_day' => $dto->rentalPricePerDay,
            'security_deposit_amount' => $dto->securityDepositAmount,
            'cleaning_fee' => $dto->cleaningFee,
            'late_fee_per_day' => $dto->lateFeePerDay,
            'turnaround_buffer_days' => $dto->turnaroundBufferDays,
            'condition_rating' => $dto->conditionRating,
            'sizes' => $dto->sizes,
        ], $atelierId);

        if ($dto->images !== []) {
            $this->attachImages($dress->id, $atelierId, $dto->images);
        }

        return $dress->refresh();
    }

    public function updateDress(int $dressId, UpdateDressDTO $dto): Dress
    {
        $dress = $this->repository->findDress($dressId);

        if ($dress === null) {
            throw DressNotFoundException::forDress($dressId);
        }

        $this->repository->updateDress($dressId, $dto->toArray());

        if ($dto->sizes !== []) {
            $this->syncSizeMatrix($dressId, $dto->sizes);
        }

        if ($dto->images !== []) {
            $existingCount = $dress->images->count();
            $this->attachImages($dressId, $dress->atelier_id, $dto->images, $existingCount);
        }

        return $this->repository->findDress($dressId) ?? throw DressNotFoundException::forDress($dressId);
    }

    public function publishDress(int $dressId): void
    {
        $this->repository->publishDress($dressId);
    }

    public function archiveDress(int $dressId): void
    {
        $this->repository->archiveDress($dressId);
    }

    public function deleteDress(int $dressId): void
    {
        $this->repository->deleteDress($dressId);
    }

    public function syncSizeMatrix(int $dressId, array $sizes): void
    {
        $this->repository->syncSizes($dressId, $sizes);
    }

    public function reorderImages(int $dressId, array $imageOrderIds): void
    {
        $this->repository->reorderImages($dressId, $imageOrderIds);
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 2;

        while ($this->repository->findBySlug($slug) !== null) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    private function toCardDTO(Dress $dress): DressCardResourceDTO
    {
        $primary = $dress->images->firstWhere('is_primary', true) ?? $dress->images->first();

        return new DressCardResourceDTO(
            id: $dress->id,
            slug: $dress->slug,
            title: $dress->title,
            atelierId: $dress->atelier_id,
            atelierName: $dress->atelier?->business_name ?? 'Atelier',
            categoryName: $dress->category?->name ?? '',
            rentalPricePerDay: Money::fromDecimal($dress->rental_price_per_day, self::CURRENCY),
            securityDepositAmount: Money::fromDecimal($dress->security_deposit_amount, self::CURRENCY),
            primaryImagePath: $primary?->image_path,
            thumbnailPath: $primary?->thumbnail_path,
            status: $dress->status,
            conditionRating: $dress->condition_rating ?? 'good',
            availableSizes: $dress->sizes->where('is_available', true)->pluck('size_code')->sort()->values()->all(),
        );
    }

    /**
     * @param  list<UploadedFile>  $files
     */
    private function attachImages(int $dressId, int $atelierId, array $files, int $startOrder = 0): void
    {
        $imageData = [];

        foreach ($files as $index => $file) {
            $asset = $this->storeImage($file, $atelierId, $dressId);

            $imageData[] = [
                'image_path' => $asset->path,
                'thumbnail_path' => $asset->thumbnailPath,
                'display_order' => $startOrder + $index + 1,
                'is_primary' => $startOrder === 0 && $index === 0,
                'alt_text' => $file->getClientOriginalName(),
            ];
        }

        $this->repository->syncImages($dressId, $imageData);
    }

    private function storeImage(UploadedFile $file, int $atelierId, int $dressId): StoredAssetDTO
    {
        return $this->media->storeOptimizedImage([
            'tmp_name' => $file->getRealPath(),
            'atelier_id' => $atelierId,
            'dress_id' => $dressId,
        ]);
    }
}
