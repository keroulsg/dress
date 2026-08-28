<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Application\DTOs;

/**
 * Immutable catalog browse filter.
 */
final readonly class DressFilterDTO
{
    /**
     * @param  list<string>  $sizes
     * @param  list<string>  $silhouettes
     * @param  list<string>  $fabrics
     * @param  list<string>  $colors
     * @param  list<int>  $categories
     */
    public function __construct(
        public array $categories = [],
        public array $sizes = [],
        public array $silhouettes = [],
        public array $fabrics = [],
        public array $colors = [],
        public float|int|string|null $priceMin = null,
        public float|int|string|null $priceMax = null,
        public string $sort = 'newest',
        public int $page = 1,
        public int $perPage = 24,
    ) {}
}
