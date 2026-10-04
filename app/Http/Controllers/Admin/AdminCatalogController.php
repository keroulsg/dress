<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Dress::query()->with(['atelier', 'category', 'primaryImage']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('atelier', function ($aq) use ($search): void {
                        $aq->where('business_name', 'like', "%{$search}%");
                    });
            });
        }

        $dresses = $query->latest('id')->paginate(15)->withQueryString();

        $stats = [
            'total' => Dress::count(),
            'active' => Dress::where('status', 'active')->count(),
            'draft' => Dress::where('status', 'draft')->count(),
            'hidden' => Dress::where('status', 'hidden')->count(),
        ];

        $categories = Category::query()->where('is_active', true)->get(['id', 'name_ar', 'name_en']);

        return Inertia::render('Admin/Catalog/Index', [
            'dresses' => $dresses,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'category_id']),
        ]);
    }

    public function togglePublish(Dress $dress): RedirectResponse
    {
        $newStatus = $dress->status === 'active' ? 'hidden' : 'active';
        $dress->update(['status' => $newStatus]);

        return back()->with('success', "تم تحديث حالة الفستان إلى {$newStatus}.");
    }

    public function destroy(Dress $dress): RedirectResponse
    {
        $dress->delete();

        return back()->with('success', 'تم حذف الفستان بنجاح.');
    }
}
