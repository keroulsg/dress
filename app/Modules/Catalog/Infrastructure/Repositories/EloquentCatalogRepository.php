<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Infrastructure\Repositories;

use App\Modules\Catalog\Application\DTOs\DressFilterDTO;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Entities\DressImage;
use App\Modules\Catalog\Domain\Entities\DressSize;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class EloquentCatalogRepository implements CatalogRepository
{
    public function findDress(int $dressId): ?Dress
    {
        return Dress::query()
            ->with(['sizes', 'images'])
            ->find($dressId);
    }

    public function findBySlug(string $slug): ?Dress
    {
        return Dress::query()
            ->with(['atelier', 'category', 'sizes', 'images'])
            ->where('slug', $slug)
            ->first();
    }

    public function isPublished(int $dressId): ?bool
    {
        $exists = Dress::query()->whereKey($dressId)->exists();

        if (! $exists) {
            return null;
        }

        return Dress::query()
            ->whereKey($dressId)
            ->where('status', 'active')
            ->whereNotNull('published_at')
            ->exists();
    }

    public function publishedDressIds(int $atelierId, int $perPage, int $page): array
    {
        $query = Dress::query()
            ->where('status', 'active')
            ->whereNotNull('published_at')
            ->orderBy('id');

        if ($atelierId > 0) {
            $query->where('atelier_id', $atelierId);
        }

        return $query->forPage($page, $perPage)->pluck('id')->all();
    }

    public function createDress(array $data, int $atelierId): Dress
    {
        $sizes = $data['sizes'] ?? [];
        unset($data['sizes']);

        $dress = Dress::query()->create([...$data, 'atelier_id' => $atelierId, 'status' => 'draft']);

        if ($sizes !== []) {
            $this->syncSizes($dress->id, $sizes);
        }

        return $dress;
    }

    public function updateDress(int $dressId, array $data): bool
    {
        $dress = Dress::query()->find($dressId);

        if ($dress === null) {
            return false;
        }

        return $dress->update($data);
    }

    public function publishDress(int $dressId): void
    {
        Dress::query()->whereKey($dressId)->update([
            'status' => 'active',
            'published_at' => now(),
        ]);
    }

    public function archiveDress(int $dressId): void
    {
        Dress::query()->whereKey($dressId)->update([
            'status' => 'retired',
            'published_at' => null,
        ]);
    }

    public function deleteDress(int $dressId): void
    {
        Dress::query()->whereKey($dressId)->delete();
    }

    public function paginatePublished(DressFilterDTO $filter): LengthAwarePaginator
    {
        $query = Dress::query()
            ->where('status', 'active')
            ->whereNotNull('published_at')
            ->with(['atelier:id,business_name', 'category:id,name', 'sizes', 'images']);

        $this->applyFilters($query, $filter);

        [$column, $direction] = match ($filter->sort) {
            'price_asc' => ['rental_price_per_day', 'asc'],
            'price_desc' => ['rental_price_per_day', 'desc'],
            default => ['published_at', 'desc'],
        };

        $query->orderBy($column, $direction);

        return $query->paginate($filter->perPage, ['*'], 'page', $filter->page);
    }

    public function facetCounts(DressFilterDTO $filter): array
    {
        $base = Dress::query()->where('status', 'active')->whereNotNull('published_at');

        $facetFilter = new DressFilterDTO(
            categories: $filter->categories,
            sizes: [],
            silhouettes: $filter->silhouettes,
            fabrics: $filter->fabrics,
            colors: $filter->colors,
            priceMin: $filter->priceMin,
            priceMax: $filter->priceMax,
        );

        $this->applyFilters($base, $facetFilter);

        $dressIds = (clone $base)->pluck('id')->all();

        $sizes = DressSize::query()
            ->whereIn('dress_id', $dressIds)
            ->where('is_available', true)
            ->distinct()
            ->pluck('size_code')
            ->sort()
            ->values()
            ->all();

        $silhouettes = (clone $base)->whereNotNull('silhouette')->distinct()->pluck('silhouette')->values()->all();
        $fabrics = (clone $base)->whereNotNull('fabric_type')->distinct()->pluck('fabric_type')->values()->all();
        $colors = (clone $base)->whereNotNull('color_primary')->distinct()->pluck('color_primary')->values()->all();

        $prices = (clone $base)->selectRaw('MIN(rental_price_per_day) as min_price, MAX(rental_price_per_day) as max_price')->first();

        return [
            'sizes' => $sizes,
            'silhouettes' => $silhouettes,
            'fabrics' => $fabrics,
            'colors' => $colors,
            'price_min' => $prices ? (float) $prices->min_price : 0,
            'price_max' => $prices ? (float) $prices->max_price : 0,
        ];
    }

    public function paginateAtelierDresses(int $atelierId, ?string $status, int $perPage, int $page): LengthAwarePaginator
    {
        $query = Dress::query()
            ->where('atelier_id', $atelierId)
            ->with(['category:id,name', 'images'])
            ->orderByDesc('updated_at');

        if ($status !== null && $status !== '') {
            $query->where('status', $status);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function categoriesForFilters(): array
    {
        return Category::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->all();
    }

    public function syncSizes(int $dressId, array $sizes): void
    {
        DressSize::query()->where('dress_id', $dressId)->delete();

        foreach ($sizes as $size) {
            DressSize::query()->create([
                'dress_id' => $dressId,
                'size_code' => $size['size_code'],
                'bust' => $size['bust'] ?? null,
                'waist' => $size['waist'] ?? null,
                'hips' => $size['hips'] ?? null,
                'length' => $size['length'] ?? null,
                'is_available' => (bool) ($size['is_available'] ?? true),
            ]);
        }
    }

    public function syncImages(int $dressId, array $imageData): void
    {
        foreach ($imageData as $image) {
            DressImage::query()->create([
                'dress_id' => $dressId,
                'image_path' => $image['image_path'],
                'thumbnail_path' => $image['thumbnail_path'] ?? null,
                'display_order' => $image['display_order'],
                'is_primary' => $image['is_primary'],
                'alt_text' => $image['alt_text'] ?? null,
            ]);
        }
    }

    public function reorderImages(int $dressId, array $imageOrderIds): void
    {
        foreach ($imageOrderIds as $index => $imageId) {
            DressImage::query()
                ->where('dress_id', $dressId)
                ->whereKey($imageId)
                ->update(['display_order' => $index + 1]);
        }
    }

    private function applyFilters(Builder $query, DressFilterDTO $filter): void
    {
        if ($filter->categories !== []) {
            $query->whereIn('category_id', $filter->categories);
        }

        if ($filter->silhouettes !== []) {
            $query->whereIn('silhouette', $filter->silhouettes);
        }

        if ($filter->fabrics !== []) {
            $query->whereIn('fabric_type', $filter->fabrics);
        }

        if ($filter->colors !== []) {
            $query->whereIn('color_primary', $filter->colors);
        }

        if ($filter->priceMin !== null) {
            $query->where('rental_price_per_day', '>=', $filter->priceMin);
        }

        if ($filter->priceMax !== null) {
            $query->where('rental_price_per_day', '<=', $filter->priceMax);
        }

        if ($filter->sizes !== []) {
            $query->whereHas('sizes', fn (Builder $q): Builder => $q
                ->whereIn('size_code', $filter->sizes)
                ->where('is_available', true));
        }
    }
}
