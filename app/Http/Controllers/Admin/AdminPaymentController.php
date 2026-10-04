<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Payment\Domain\Entities\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Transaction::query()->with(['user', 'atelier', 'booking']);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('gateway_reference', 'like', "%{$search}%")
                    ->orWhere('idempotency_key', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search): void {
                        $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $transactions = $query->latest('id')->paginate(15)->withQueryString();

        $stats = [
            'total_volume' => (float) Transaction::where('status', 'captured')->sum('amount'),
            'total_transactions' => Transaction::count(),
            'successful' => Transaction::where('status', 'captured')->count(),
            'pending' => Transaction::where('status', 'pending')->count(),
            'refunded' => Transaction::where('status', 'refunded')->count(),
        ];

        return Inertia::render('Admin/Payments/Index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }
}
