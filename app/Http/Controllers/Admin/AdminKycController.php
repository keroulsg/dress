<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\KYC\Domain\Enums\KycStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminKycController extends Controller
{
    public function index(Request $request): Response
    {
        $query = KycVerification::query()->with(['user.ateliers']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('role')) {
            $role = $request->role;
            $query->whereHas('user', function ($uq) use ($role): void {
                $uq->where('role', $role);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($uq) use ($search): void {
                $uq->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $kycs = $query->latest('id')->paginate(15)->through(function (KycVerification $kyc): array {
            return [
                'id' => $kyc->id,
                'user_id' => $kyc->user_id,
                'document_type' => $kyc->document_type,
                'status' => $kyc->status instanceof KycStatus ? $kyc->status->value : (string) $kyc->status,
                'rejection_reason' => $kyc->rejection_reason,
                'created_at' => $kyc->created_at?->toISOString(),
                'user' => [
                    'id' => $kyc->user?->id,
                    'name' => $kyc->user?->name,
                    'email' => $kyc->user?->email,
                    'phone' => $kyc->user?->phone,
                    'role' => $kyc->user?->role,
                    'atelier_name' => $kyc->user?->ateliers?->first()?->business_name,
                ],
                'front_url' => route('kyc.documents.show', ['verification' => $kyc->id, 'side' => 'front']),
                'back_url' => $kyc->back_path ? route('kyc.documents.show', ['verification' => $kyc->id, 'side' => 'back']) : null,
                'front_download_url' => route('kyc.documents.show', ['verification' => $kyc->id, 'side' => 'front', 'download' => 1]),
                'back_download_url' => $kyc->back_path ? route('kyc.documents.show', ['verification' => $kyc->id, 'side' => 'back', 'download' => 1]) : null,
            ];
        })->withQueryString();

        $stats = [
            'total' => KycVerification::count(),
            'pending' => KycVerification::where('status', 'pending')->count(),
            'approved' => KycVerification::where('status', 'approved')->count(),
            'rejected' => KycVerification::where('status', 'rejected')->count(),
            'atelier_owners' => KycVerification::whereHas('user', fn ($q) => $q->where('role', 'atelier_owner'))->count(),
            'renters' => KycVerification::whereHas('user', fn ($q) => $q->where('role', 'renter'))->count(),
        ];

        return Inertia::render('Admin/Kyc/Index', [
            'kycs' => $kycs,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'role']),
        ]);
    }

    public function review(Request $request, KycVerification $kyc): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $kyc->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['status'] === 'rejected' ? $validated['rejection_reason'] : null,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        if ($validated['status'] === 'approved' && $kyc->user?->role === 'atelier_owner') {
            $kyc->user->ateliers()->update([
                'approved_at' => now(),
                'is_active' => true,
            ]);
        }

        $statusText = $validated['status'] === 'approved' ? 'قبول واعتماد' : 'رفض';

        return back()->with('success', "تم {$statusText} طلب التحقق من الهوية بنجاح.");
    }
}
