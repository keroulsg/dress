<?php

declare(strict_types=1);

namespace App\Modules\Booking\Http\Controllers\Customer;

use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Http\Requests\CancelBookingRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $isPaid = $booking->status !== BookingStatus::PendingPayment;
        $atelier = $booking->atelier;

        $atelierPayload = $atelier ? [
            'id' => $atelier->id,
            'business_name' => $atelier->business_name,
            'city' => $atelier->city ?? 'Cairo',
            'address' => $isPaid ? $atelier->address : null,
            'phone' => $isPaid ? $atelier->phone : null,
            'whatsapp' => $isPaid ? ($atelier->whatsapp_number ?? $atelier->phone) : null,
            'email' => $isPaid ? $atelier->email : null,
            'maps_url' => $isPaid ? ($atelier->latitude && $atelier->longitude
                ? "https://www.google.com/maps/search/?api=1&query={$atelier->latitude},{$atelier->longitude}"
                : 'https://www.google.com/maps/search/?api=1&query='.urlencode(($atelier->business_name ?? '').' '.($atelier->address ?? '').' '.($atelier->city ?? ''))) : null,
            'is_details_revealed' => $isPaid,
        ] : null;

        return Inertia::render('Customer/Bookings/Show', [
            'booking' => [
                ...$booking->toArray(),
                'atelier' => $atelierPayload,
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

    public function flagDepositWithheld(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('view', $booking);

        if ($booking->order_type === 'direct_sale') {
            return back()->with('error', 'الطلبات المباشرة لا تتضمن مبلغ تأمين.');
        }

        // Freeze store payout
        if ($booking->atelier) {
            $booking->atelier->blockPayouts();
        }

        $booking->deposit_disputed = true;
        $booking->save();

        if (in_array($booking->status, [BookingStatus::ReturnedPendingInspection, BookingStatus::InspectionCompleted], true)) {
            $this->bookings->transitionStatus($booking->id, BookingStatus::Disputed, [
                'actor_id' => (int) $request->user()->id,
                'reason' => 'نزاع من العميلة: تم تسليم القطعة ولم يتم رد التأمين.',
            ]);
        }

        return back()->with('success', 'تم تجميد مستحقات المتجر وفتح شكوى رسمية للإدارة المركزية للتحقيق الفوري.');
    }

    private function toCard(Booking $booking): array
    {
        $firstItem = $booking->items->first();
        $dress = $firstItem?->dress;

        return [
            'id' => $booking->id,
            'booking_reference' => $booking->booking_reference,
            'status' => $booking->status->value,
            'start_date' => $booking->start_date?->toDateString(),
            'end_date' => $booking->end_date?->toDateString(),
            'grand_total' => $booking->grand_total,
            'currency' => $booking->currency,
            'atelier' => $booking->atelier?->business_name,
            'dress_title' => $dress?->title,
            'dress_slug' => $dress?->slug,
            'dress_id' => $dress?->id,
            'payment_url' => $booking->status === BookingStatus::PendingPayment ? "/checkout/{$booking->id}/pay" : null,
        ];
    }
}
