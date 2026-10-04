<?php

declare(strict_types=1);

namespace App\Modules\Booking\Http\Controllers\Atelier;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Http\Requests\TransitionBookingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                'renter' => [
                    'id' => $booking->renter?->id,
                    'name' => $booking->renter?->name,
                    'phone' => $booking->renter?->phone,
                    'has_kyc' => $booking->renter?->latestKycVerification !== null,
                    'kyc_status' => $booking->renter?->latestKycVerification?->status?->value ?? 'unverified',
                    'front_doc_url' => $booking->renter?->latestKycVerification ? route('kyc.documents.show', ['verification' => $booking->renter->latestKycVerification->id, 'side' => 'front']) : null,
                    'back_doc_url' => $booking->renter?->latestKycVerification?->back_path ? route('kyc.documents.show', ['verification' => $booking->renter->latestKycVerification->id, 'side' => 'back']) : null,
                ],
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

    public function show(Atelier $atelier, Booking $booking): Response
    {
        if ($booking->atelier_id !== $atelier->id) {
            abort(403, 'غير مصرح لك بالوصول لهذا الحجز.');
        }

        $booking->load(['renter.latestKycVerification', 'items.dress']);
        $kyc = $booking->renter?->latestKycVerification;

        return Inertia::render('Atelier/Bookings/Show', [
            'atelier' => ['id' => $atelier->id, 'business_name' => $atelier->business_name],
            'booking' => [
                'id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'status' => $booking->status->value,
                'start_date' => $booking->start_date?->toDateString(),
                'end_date' => $booking->end_date?->toDateString(),
                'grand_total' => $booking->grand_total,
                'currency' => $booking->currency,
                'rental_rate_total' => $booking->rental_rate_total,
                'cleaning_fee_total' => $booking->cleaning_fee_total,
                'security_deposit_amount' => $booking->security_deposit_amount,
                'delivery_address' => $booking->delivery_address,
                'renter' => [
                    'id' => $booking->renter?->id,
                    'name' => $booking->renter?->name,
                    'phone' => $booking->renter?->phone,
                    'email' => $booking->renter?->email,
                    'has_kyc' => $kyc !== null,
                    'kyc_status' => $kyc?->status?->value ?? 'unverified',
                    'front_doc_url' => $kyc ? route('kyc.documents.show', ['verification' => $kyc->id, 'side' => 'front']) : null,
                    'back_doc_url' => $kyc?->back_path ? route('kyc.documents.show', ['verification' => $kyc->id, 'side' => 'back']) : null,
                ],
                'order_type' => $booking->order_type ?? 'rental',
                'returned_at' => $booking->returned_at?->toIso8601String(),
                'deposit_disputed' => (bool) $booking->deposit_disputed,
                'deposit_refunded_at' => $booking->deposit_refunded_at?->toIso8601String(),
                'items' => $booking->items->map(fn ($item): array => [
                    'dress_title' => $item->dress?->title,
                    'quantity' => $item->quantity,
                    'unit_rental_price' => $item->unit_rental_price,
                    'rental_days' => $item->rental_days,
                    'subtotal' => $item->subtotal,
                ])->values()->all(),
            ],
            'statuses' => array_column(BookingStatus::cases(), 'value'),
        ]);
    }

    public function confirmDepositRefunded(Request $request, Atelier $atelier, Booking $booking): RedirectResponse
    {
        if ($booking->atelier_id !== $atelier->id) {
            abort(403, 'غير مصرح لك بالوصول لهذا الحجز.');
        }

        $booking->deposit_refunded_at = now();
        $booking->save();

        $this->bookings->transitionStatus(
            $booking->id,
            BookingStatus::Completed,
            ['actor_id' => (int) $request->user()->id, 'reason' => 'تم استلام القطعة والتأكد من سلامتها ورد التأمين للعميلة.']
        );

        return back()->with('success', 'تم تأكيد إرجاع مبلغ التأمين للعميلة وإغلاق الحجز بنجاح.');
    }

    public function fileDamageClaim(Request $request, Atelier $atelier, Booking $booking): RedirectResponse
    {
        if ($booking->atelier_id !== $atelier->id) {
            abort(403, 'غير مصرح لك بالوصول لهذا الحجز.');
        }

        $request->validate([
            'damage_description' => ['required', 'string', 'min:10'],
            'repair_cost' => ['required', 'numeric', 'min:0'],
        ]);

        $booking->deposit_disputed = true;
        $booking->save();

        $reason = sprintf(
            'بلاغ تلفيات من الأتيليه: %s (تكلفة الإصلاح المقدرة: %s %s)',
            $request->input('damage_description'),
            $request->input('repair_cost'),
            $booking->currency
        );

        $this->bookings->transitionStatus(
            $booking->id,
            BookingStatus::Disputed,
            ['actor_id' => (int) $request->user()->id, 'reason' => $reason]
        );

        return back()->with('success', 'تم تسجيل بلاغ التلفيات وفتح نزاع التأمين لدى إدارة المنصة.');
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
