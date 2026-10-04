<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Administration\Domain\Entities\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuditController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::query()->with('user');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('auditable_type', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search): void {
                        $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $logs = $query->latest('id')->paginate(20)->withQueryString();

        $stats = [
            'total_events' => AuditLog::count(),
            'today_events' => AuditLog::whereDate('created_at', today())->count(),
            'actions_tracked' => AuditLog::distinct('action')->count('action'),
        ];

        return Inertia::render('Admin/Audit/Index', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => $request->only(['search', 'action']),
        ]);
    }
}
