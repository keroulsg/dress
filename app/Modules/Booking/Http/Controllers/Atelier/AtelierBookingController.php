<?php

declare(strict_types=1);

namespace App\Modules\Booking\Http\Controllers\Atelier;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Http\Requests\TransitionBookingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AtelierBookingController extends Controller
{
    public function __construct(private readonly BookingOrchestratorContract $bookings) {}

    public function index(Atelier $atelier): Response
    {
        $status = request()->query('status');

        $pipeline = Booking::query()
            ->where('atelier_id', $atelier->id)
            ->with(['renter:id,name,phone', 'items.dress:id,title'])
            ->when(is_string($status) && $status !== '', fn ($query) => $query->where('status', $status))
            ->orderByDesc('start_date')
            ->paginate(15);

        return Inertia::render('Atelier/Bookings/Index', [
            'atelier' => ['id' => $atelier->id, 'business_name' => $atelier->business_name],
            'bookings' => $pipeline->through(fn (Booking $booking): array => [
                'id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'status' => $booking->status->value,
                'start_date' => $booking->start_date?->toDateString(),
                'end_date' => $booking->end_date?->toDateString(),
                'grand_total' => $booking->grand_total,
                'currency' => $booking->currency,
                'renter' => ['name' => $booking->renter?->name, 'phone' => $booking->renter?->phone],
                'dress_title' => $booking->items->first()?->dress?->title,
            ])->items(),
            'pagination' => [
                'total' => $pipeline->total(),
                'current_page' => $pipeline->currentPage(),
                'last_page' => $pipeline->lastPage(),
            ],
            'status' => $status,
            'statuses' => array_column(BookingStatus::cases(), 'value'),
        ]);
    }

    public function transition(TransitionBookingRequest $request, Atelier $atelier, Booking $booking): RedirectResponse
    {
        $this->bookings->transitionStatus(
            $booking->id,
            BookingStatus::from((string) $request->string('target_status')),
            ['actor_id' => (int) $request->user()->id, 'reason' => $request->input('reason')],
        );

        return back()->with('success', 'Booking state updated.');
    }
}
