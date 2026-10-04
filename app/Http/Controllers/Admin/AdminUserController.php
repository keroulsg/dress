<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()->withCount(['ateliers', 'bookings']);

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->latest('id')->paginate(15)->withQueryString();

        $stats = [
            'total' => User::count(),
            'superadmins' => User::whereIn('role', ['superadmin', 'super_admin'])->count(),
            'ateliers' => User::where('role', 'atelier_owner')->count(),
            'renters' => User::where('role', 'renter')->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:superadmin,atelier_owner,renter',
        ]);

        $user->update(['role' => $validated['role']]);

        return back()->with('success', "تم تحديث دور المستخدم {$user->name} بنجاح.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'لا يمكن حذف حسابك الحالي.');
        }

        $user->delete();

        return back()->with('success', 'تم حذف المستخدم بنجاح.');
    }
}
