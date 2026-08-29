<?php

declare(strict_types=1);

namespace App\Modules\Booking\Http\Controllers\Customer;

use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Http\Requests\CancelBookingRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CustomerBookingController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly BookingOrchestratorContract $bookings) {}

    public function index(): Response
    {
        $bookings = Booking::query()
            ->where('renter_id', auth()->id())
            ->with(['atelier:id,business_name', 'items.dress:id,title,slug'])
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('Customer/Bookings/Index', [
            'bookings' => $bookings->through(fn (Booking $booking): array => $this->toCard($booking))->items(),
            'pagination' => [
                'total' => $bookings->total(),
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
            ],
        ]);
    }

    public function show(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        $booking->load(['atelier', 'items.dress:id,title,slug']);

        return Inertia::render('Customer/Bookings/Show', [
            'booking' => [
                ...$booking->toArray(),
                'items' => $booking->items->map(fn ($item): array => [
                    'dress_title' => $item->dress?->title,
                    'quantity' => $item->quantity,
                    'unit_rental_price' => $item->unit_rental_price,
                    'rental_days' => $item->rental_days,
                    'subtotal' => $item->subtotal,
                ])->values()->all(),
            ],
        ]);
    }

    public function cancel(CancelBookingRequest $request, Booking $booking): RedirectResponse
    {
        $this->bookings->cancelBooking($booking->id, (int) $request->user()->id, (string) $request->string('reason'));

        return back()->with('success', 'Booking cancelled and dates released.');
    }

    private function toCard(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'booking_reference' => $booking->booking_reference,
            'status' => $booking->status->value,
            'start_date' => $booking->start_date?->toDateString(),
            'end_date' => $booking->end_date?->toDateString(),
            'grand_total' => $booking->grand_total,
            'currency' => $booking->currency,
            'atelier' => $booking->atelier?->business_name,
            'dress_title' => $booking->items->first()?->dress?->title,
        ];
    }
}
