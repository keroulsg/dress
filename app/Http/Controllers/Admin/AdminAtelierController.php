<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAtelierController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Atelier::query()->with('owner')->withCount('dresses');

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('business_name', 'like', "%{$search}%")
                    ->orWhere('license_number', 'like', "%{$search}%")
                    ->orWhereHas('owner', function ($oq) use ($search): void {
                        $oq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $ateliers = $query->latest('id')->paginate(15)->withQueryString();

        $stats = [
            'total' => Atelier::count(),
            'active' => Atelier::where('is_active', true)->count(),
            'pending_approval' => Atelier::whereNull('approved_at')->count(),
            'total_dresses' => Dress::count(),
        ];

        return Inertia::render('Admin/Ateliers/Index', [
            'ateliers' => $ateliers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function toggleStatus(Atelier $atelier): RedirectResponse
    {
        $atelier->update([
            'is_active' => ! $atelier->is_active,
            'approved_at' => $atelier->approved_at ?? now(),
        ]);

        $statusText = $atelier->is_active ? 'تفعيل' : 'إيقاف';

        return back()->with('success', "تم {$statusText} الأتيليه بنجاح.");
    }

    public function updateCommission(Request $request, Atelier $atelier): RedirectResponse
    {
        $validated = $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:1',
        ]);

        $atelier->update(['commission_rate' => $validated['commission_rate']]);

        return back()->with('success', 'تم تعديل نسبة العمولة بنجاح.');
    }
}
