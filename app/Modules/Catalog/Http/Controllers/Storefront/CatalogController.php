<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Controllers\Storefront;

use App\Modules\Catalog\Application\DTOs\DressFilterDTO;
use App\Modules\Catalog\Domain\Contracts\CatalogReader;
use App\Modules\Catalog\Domain\Exceptions\DressNotFoundException;
use App\Modules\Catalog\Http\Requests\FilterCatalogRequest;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function __construct(private readonly CatalogReader $catalog) {}

    public function index(FilterCatalogRequest $request): Response
    {
        $filter = new DressFilterDTO(
            categories: array_map('intval', (array) $request->input('category', [])),
            sizes: (array) $request->input('sizes', []),
            silhouettes: (array) $request->input('silhouettes', []),
            fabrics: (array) $request->input('fabrics', []),
            colors: (array) $request->input('colors', []),
            priceMin: $request->filled('price_min') ? $request->float('price_min') : null,
            priceMax: $request->filled('price_max') ? $request->float('price_max') : null,
            sort: (string) $request->input('sort', 'newest'),
            page: max(1, (int) $request->input('page', 1)),
        );

        $result = $this->catalog->searchCatalog($filter);

        return Inertia::render('Catalog/Index', [
            'dresses' => $result['dresses'],
            'facets' => $result['facets'],
            'pagination' => $result['pagination'],
            'filters' => [
                'categories' => $filter->categories,
                'sizes' => $filter->sizes,
                'silhouettes' => $filter->silhouettes,
                'fabrics' => $filter->fabrics,
                'colors' => $filter->colors,
                'price_min' => $filter->priceMin,
                'price_max' => $filter->priceMax,
                'sort' => $filter->sort,
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        try {
            $dress = $this->catalog->getDressDetail($slug);
        } catch (DressNotFoundException) {
            abort(404);
        }

        return Inertia::render('Catalog/Show', [
            'dress' => $dress->toArray(),
        ]);
    }
}
