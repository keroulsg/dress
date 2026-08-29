<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Http\Controllers\Customer;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Inspection\Domain\Contracts\InspectionContract;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CustomerInspectionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly InspectionContract $inspections) {}

    public function show(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        $summary = $this->inspections->getBookingInspectionSummary($booking->id);

        return Inertia::render('Customer/Inspections/Show', [
            'booking' => [
                'id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'start_date' => $booking->start_date?->toDateString(),
                'end_date' => $booking->end_date?->toDateString(),
            ],
            'summary' => $summary->toArray(),
        ]);
    }

    public function approve(Booking $booking): RedirectResponse
    {
        $this->authorize('view', $booking);

        $reportId = collect($this->inspections->getBookingInspectionSummary($booking->id)->toArray()['post_return_report'] ?? [])['id'] ?? null;

        if ($reportId !== null) {
            $this->inspections->customerApproveInspection((int) $reportId, (int) auth()->id());
        }

        return back()->with('success', 'Inspection approved.');
    }
}
