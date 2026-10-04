<?php

declare(strict_types=1);

namespace App\Modules\Storefront\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Review\Domain\Entities\Review;
use Inertia\Inertia;
use Inertia\Response;

class DressShowController extends Controller
{
    public function show(string $slug): Response
    {
        $dress = Dress::with(['atelier', 'category', 'images', 'sizes'])
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $reviews = Review::with('user')
            ->where('dress_id', $dress->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Storefront/DressShow', [
            'dress' => $dress,
            'reviews' => $reviews,
        ]);
    }
}
