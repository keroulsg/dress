<?php

declare(strict_types=1);

namespace App\Modules\Storefront\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchSuggestionsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json(['dresses' => []]);
        }

        $dresses = Dress::with('primaryImage')
            ->where('status', 'active')
            ->where('title', 'like', "%{$query}%")
            ->take(5)
            ->get();

        return response()->json([
            'dresses' => $dresses,
        ]);
    }
}
