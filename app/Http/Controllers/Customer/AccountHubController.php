<?php

declare(strict_types=1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Dispute\Domain\Entities\Dispute;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\KYC\Domain\Enums\KycStatus;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Review\Domain\Entities\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountHubController extends Controller
{
    public function overview(Request $request): Response
    {
        $user = $request->user();

        $activeBookings = Booking::query()
            ->where('renter_id', $user->id)
            ->with(['atelier:id,business_name', 'items.dress:id,title,slug'])
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Booking $b): array => [
                'id' => $b->id,
                'booking_reference' => $b->booking_reference,
                'status' => $b->status->value,
                'start_date' => $b->start_date?->toDateString(),
                'end_date' => $b->end_date?->toDateString(),
                'grand_total' => $b->grand_total,
                'currency' => $b->currency,
                'atelier' => $b->atelier?->business_name,
                'dress_title' => $b->items->first()?->dress?->title,
                'payment_url' => $b->status === BookingStatus::PendingPayment ? "/checkout/{$b->id}/pay" : null,
            ]);

        $kyc = KycVerification::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->first();

        $isVerified = $kyc && ($kyc->status === KycStatus::Approved || $kyc->status?->value === 'approved' || (string) $kyc->status === 'approved');

        return Inertia::render('Customer/Overview', [
            'active_bookings' => $activeBookings,
            'stats' => [
                'total_bookings' => Booking::query()->where('renter_id', $user->id)->count(),
                'saved_count' => 0,
                'open_disputes' => Dispute::query()->where('opened_by', $user->id)->where('status', 'open')->count(),
            ],
            'kyc' => [
                'id' => $kyc?->id,
                'is_verified' => $isVerified,
                'status' => $isVerified ? 'approved' : ($kyc?->status?->value ?? ($kyc?->status ?? 'unverified')),
                'rejection_reason' => $kyc?->rejection_reason,
            ],
        ]);
    }

    public function saved(Request $request): Response
    {
        // Sample featured / saved dresses
        $dresses = Dress::query()
            ->where('status', 'active')
            ->with(['atelier:id,business_name', 'images', 'sizes'])
            ->limit(6)
            ->get();

        return Inertia::render('Customer/Saved', [
            'saved_dresses' => $dresses,
        ]);
    }

    public function payments(Request $request): Response
    {
        $transactions = Transaction::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Transaction $t): array => [
                'id' => $t->id,
                'booking_id' => $t->booking_id,
                'type' => $t->type,
                'amount' => $t->amount,
                'currency' => $t->currency,
                'status' => $t->status,
                'payment_method' => $t->payment_method,
                'created_at' => $t->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('Customer/Payments', [
            'transactions' => $transactions,
        ]);
    }

    public function disputes(Request $request): Response
    {
        $disputes = Dispute::query()
            ->where('opened_by', $request->user()->id)
            ->with(['booking:id,booking_reference'])
            ->latest()
            ->get()
            ->map(fn (Dispute $d): array => [
                'id' => $d->id,
                'booking_reference' => $d->booking?->booking_reference,
                'reason' => $d->reason,
                'status' => $d->status,
                'created_at' => $d->created_at?->toDateTimeString(),
                'resolution' => $d->resolution,
            ]);

        return Inertia::render('Customer/Disputes', [
            'disputes' => $disputes,
        ]);
    }

    public function reviews(Request $request): Response
    {
        $reviews = Review::query()
            ->where('renter_id', $request->user()->id)
            ->with(['dress:id,title,slug'])
            ->latest()
            ->get()
            ->map(fn (Review $r): array => [
                'id' => $r->id,
                'dress_title' => $r->dress?->title,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('Customer/Reviews', [
            'reviews' => $reviews,
        ]);
    }

    public function kyc(Request $request): Response
    {
        $kyc = KycVerification::query()
            ->where('user_id', $request->user()->id)
            ->latest('id')
            ->first();

        $isVerified = $kyc && ($kyc->status === KycStatus::Approved || $kyc->status?->value === 'approved' || (string) $kyc->status === 'approved');

        return Inertia::render('Customer/KYC', [
            'kyc' => [
                'id' => $kyc?->id,
                'is_verified' => $isVerified,
                'status' => $isVerified ? 'approved' : ($kyc?->status?->value ?? ($kyc?->status ?? 'unverified')),
                'document_type' => $kyc?->document_type,
                'rejection_reason' => $kyc?->rejection_reason,
                'submitted_at' => $kyc?->created_at?->toDateTimeString(),
                'front_url' => $kyc ? route('kyc.documents.show', ['verification' => $kyc->id, 'side' => 'front']) : null,
                'back_url' => $kyc?->back_path ? route('kyc.documents.show', ['verification' => $kyc->id, 'side' => 'back']) : null,
            ],
        ]);
    }

    public function profile(Request $request): Response
    {
        return Inertia::render('Customer/Profile', [
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'phone' => $request->user()->phone ?? '',
            ],
        ]);
    }
}
