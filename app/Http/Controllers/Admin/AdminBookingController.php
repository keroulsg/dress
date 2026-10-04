<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminBookingController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Booking::query()->with(['renter', 'atelier', 'dress.primaryImage']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search): void {
                $q->where('booking_reference', 'like', "%{$search}%")
                    ->orWhereHas('renter', function ($rq) use ($search): void {
                        $rq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('atelier', function ($aq) use ($search): void {
                        $aq->where('business_name', 'like', "%{$search}%");
                    });
            });
        }

        $bookings = $query->latest('id')->paginate(15)->through(fn (Booking $b) => [
            'id' => $b->id,
            'booking_reference' => $b->booking_reference,
            'dress' => $b->dress,
            'renter' => $b->renter,
            'atelier' => $b->atelier,
            'rental_start_date' => $b->start_date?->format('Y-m-d') ?? '—',
            'rental_end_date' => $b->end_date?->format('Y-m-d') ?? '—',
            'total_price' => $b->grand_total,
            'deposit_amount' => $b->security_deposit_amount,
            'status' => $b->status instanceof \BackedEnum ? $b->status->value : (string) $b->status,
        ])->withQueryString();

        $stats = [
            'total' => Booking::count(),
            'confirmed' => Booking::where('status', 'confirmed')->count(),
            'active_rentals' => Booking::whereIn('status', ['dispatched', 'delivered'])->count(),
            'completed' => Booking::where('status', 'returned')->count(),
            'cancelled' => Booking::where('status', 'cancelled')->count(),
        ];

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        $booking->status_mutated_by_machine = true;
        $booking->status = BookingStatus::Cancelled;
        $booking->save();

        return back()->with('success', "تم إلغاء الحجز رقم {$booking->booking_reference} بنجاح.");
    }
}
