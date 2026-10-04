<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Review\Domain\Entities\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Review::query()->with(['renter', 'atelier', 'dress']);

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('renter', function ($rq) use ($search): void {
                        $rq->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('dress', function ($dq) use ($search): void {
                        $dq->where('title', 'like', "%{$search}%");
                    });
            });
        }

        $reviews = $query->latest('id')->paginate(15)->withQueryString();

        $stats = [
            'total' => Review::count(),
            'average_rating' => (float) (Review::avg('rating') ?: 5.0),
            'five_star' => Review::where('rating', 5)->count(),
            'flagged_or_low' => Review::where('rating', '<=', 2)->count(),
        ];

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'stats' => $stats,
            'filters' => $request->only(['search', 'rating']),
        ]);
    }

    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'تم إزالة التقييم بنجاح.');
    }
}
