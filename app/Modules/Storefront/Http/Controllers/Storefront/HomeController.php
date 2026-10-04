<?php

declare(strict_types=1);

namespace App\Modules\Storefront\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Catalog\Domain\Entities\Dress;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $trending = Dress::with(['primaryImage', 'atelier'])
            ->where('status', 'active')
            ->orderByDesc('rating_average')
            ->orderByDesc('rating_count')
            ->take(8)
            ->get();

        $featuredAteliers = Atelier::with('owner')
            ->where('is_active', true)
            ->orderByDesc('rating_average')
            ->take(4)
            ->get();

        return Inertia::render('Storefront/Home', [
            'trending' => $trending,
            'featuredAteliers' => $featuredAteliers,
        ]);
    }
}
