<?php

declare(strict_types=1);

namespace App\Modules\Storefront\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Storefront\Application\Services\StorefrontSearchService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request, StorefrontSearchService $searchService): Response
    {
        $filters = $request->only(['category_id', 'category', 'product_type', 'mode', 'size', 'min_price', 'max_price', 'start_date', 'end_date', 'sort']);

        $results = $searchService->search($filters);
        $categories = Category::all();

        return Inertia::render('Storefront/Catalog', [
            'dresses' => $results,
            'filters' => $filters,
            'categories' => $categories,
        ]);
    }
}
