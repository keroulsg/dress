<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Dispute\Domain\Entities\Dispute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDisputeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Dispute::query()->with(['booking.dress', 'booking.atelier', 'booking.renter', 'opener']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('reason', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('booking', function ($bq) use ($search): void {
                        $bq->where('booking_reference', 'like', "%{$search}%");
                    });
            });
        }

        $disputes = $query->latest('id')->paginate(15)->withQueryString();

        $stats = [
            'total' => Dispute::count(),
            'open' => Dispute::whereIn('status', ['opened', 'under_review'])->count(),
            'resolved' => Dispute::where('status', 'resolved')->count(),
            'rejected' => Dispute::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Disputes/Index', [
            'disputes' => $disputes,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function resolve(Request $request, Dispute $dispute): RedirectResponse
    {
        $validated = $request->validate([
            'resolution' => 'required|string|max:1000',
            'status' => 'required|in:resolved,rejected',
        ]);

        $dispute->update([
            'status' => $validated['status'],
            'resolution' => $validated['resolution'],
            'resolved_by' => auth()->id(),
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'تم تسجيل قرار التحكيم وفض النزاع بنجاح.');
    }
}
