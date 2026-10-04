<?php

declare(strict_types=1);

namespace App\Http\Controllers\Atelier;

use App\Http\Controllers\Controller;
use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\KYC\Domain\Enums\KycStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AtelierStudioController extends Controller
{
    public function overview(Request $request, Atelier $atelier, LedgerContract $ledger): Response
    {
        $totalDresses = Dress::query()->where('atelier_id', $atelier->id)->count();
        $activeRentals = Booking::query()
            ->where('atelier_id', $atelier->id)
            ->whereIn('status', ['confirmed', 'dispatched', 'in_possession'])
            ->count();
        $balance = $ledger->getAtelierAvailableBalance($atelier->id);

        $recentBookings = Booking::query()
            ->where('atelier_id', $atelier->id)
            ->with(['renter:id,name', 'items.dress:id,title'])
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Booking $b): array => [
                'id' => $b->id,
                'booking_reference' => $b->booking_reference,
                'status' => $b->status->value,
                'start_date' => $b->start_date?->toDateString(),
                'end_date' => $b->end_date?->toDateString(),
                'grand_total' => $b->grand_total,
                'renter_name' => $b->renter?->name,
                'dress_title' => $b->items->first()?->dress?->title,
            ]);

        $user = $request->user();
        $owner = $atelier->owner ?? $user;
        $kyc = $owner?->latestKycVerification;
        $statusVal = $kyc?->status instanceof KycStatus ? $kyc->status->value : (string) ($kyc?->status ?? '');
        $isVerified = ($statusVal === KycStatus::Approved->value || $statusVal === 'approved');

        return Inertia::render('Atelier/Overview', [
            'atelier' => ['id' => $atelier->id, 'business_name' => $atelier->business_name, 'is_active' => $atelier->isActive()],
            'kyc' => [
                'is_verified' => $isVerified,
                'status' => $isVerified ? 'approved' : ($statusVal ?: 'unverified'),
                'rejection_reason' => $kyc?->rejection_reason,
            ],
            'stats' => [
                'total_garments' => $totalDresses,
                'active_rentals' => $activeRentals,
                'available_earnings' => $balance->amount(),
                'currency' => $balance->currency(),
            ],
            'recent_bookings' => $recentBookings,
        ]);
    }

    public function calendar(Atelier $atelier): Response
    {
        $dresses = Dress::query()
            ->where('atelier_id', $atelier->id)
            ->select(['id', 'title', 'slug'])
            ->get();

        $bookings = Booking::query()
            ->where('atelier_id', $atelier->id)
            ->with(['renter:id,name', 'items.dress:id,title'])
            ->where('end_date', '>=', now()->subDays(30))
            ->get()
            ->map(fn (Booking $b): array => [
                'id' => $b->id,
                'booking_reference' => $b->booking_reference,
                'status' => $b->status->value,
                'start_date' => $b->start_date?->toDateString(),
                'end_date' => $b->end_date?->toDateString(),
                'renter' => $b->renter?->name,
                'dress' => $b->items->first()?->dress?->title,
            ]);

        return Inertia::render('Atelier/Calendar', [
            'atelier' => ['id' => $atelier->id, 'business_name' => $atelier->business_name],
            'dresses' => $dresses,
            'bookings' => $bookings,
        ]);
    }

    public function inventory(Atelier $atelier): Response
    {
        $dresses = Dress::query()
            ->where('atelier_id', $atelier->id)
            ->with(['images', 'sizes', 'category'])
            ->latest('id')
            ->get()
            ->map(fn (Dress $d): array => [
                'id' => $d->id,
                'title' => $d->title,
                'status' => $d->status,
                'rental_price_per_day' => $d->rental_price_per_day,
                'category' => $d->category?->name,
                'primary_image' => $d->primaryImage?->image_path ?? $d->images->first()?->image_path,
                'sizes' => $d->sizes->pluck('size_code')->all(),
            ]);

        return Inertia::render('Atelier/Inventory', [
            'atelier' => ['id' => $atelier->id, 'business_name' => $atelier->business_name],
            'dresses' => $dresses,
        ]);
    }

    public function settings(Atelier $atelier): Response
    {
        $owner = $atelier->owner;
        $kyc = $owner?->latestKycVerification;
        $isVerified = $kyc && ($kyc->status === KycStatus::Approved || $kyc->status?->value === 'approved' || (string) $kyc->status === 'approved');

        return Inertia::render('Atelier/Settings', [
            'atelier' => [
                'id' => $atelier->id,
                'business_name' => $atelier->business_name,
                'slug' => $atelier->slug,
                'phone' => $atelier->phone ?? '',
                'whatsapp_number' => $atelier->whatsapp_number ?? '',
                'address' => $atelier->address ?? '',
                'city' => $atelier->city ?? '',
                'description' => $atelier->description ?? '',
                'is_active' => $atelier->isActive(),
                'commission_rate' => $atelier->commission_rate,
            ],
            'kyc' => [
                'is_verified' => $isVerified,
                'status' => $isVerified ? 'approved' : ($kyc?->status?->value ?? ($kyc?->status ?? 'unverified')),
                'document_type' => $kyc?->document_type,
                'rejection_reason' => $kyc?->rejection_reason,
                'submitted_at' => $kyc?->created_at?->toDateString(),
            ],
        ]);
    }

    public function updateSettings(Request $request, Atelier $atelier): RedirectResponse
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:120',
            'phone' => 'nullable|string|max:30',
            'whatsapp_number' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:80',
            'description' => 'nullable|string|max:1000',
        ]);

        $atelier->update($validated);

        return back()->with('success', 'تم حفظ إعدادات الأتيليه ورقم الواتساب بنجاح.');
    }
}
