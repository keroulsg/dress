<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Http\Controllers\Atelier;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Inspection\Application\DTOs\AddDamageItemDTO;
use App\Modules\Inspection\Application\DTOs\CreateInspectionDTO;
use App\Modules\Inspection\Domain\Contracts\InspectionContract;
use App\Modules\Inspection\Domain\Entities\InspectionReport;
use App\Modules\Inspection\Domain\Enums\InspectionPhase;
use App\Modules\Inspection\Http\Requests\FinalizeInspectionRequest;
use App\Modules\Inspection\Http\Requests\StoreInspectionRequest;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class InspectionWorkspaceController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly InspectionContract $inspections) {}

    public function index(Atelier $atelier): Response
    {
        $queue = Booking::query()
            ->where('atelier_id', $atelier->id)
            ->whereIn('status', [
                'confirmed',
                'fitting_scheduled',
                'returned_pending_inspection',
            ])
            ->with(['renter:id,name', 'items.dress:id,title'])
            ->orderBy('start_date')
            ->get()
            ->map(fn (Booking $booking): array => [
                'id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'status' => $booking->status->value,
                'dress_title' => $booking->items->first()?->dress?->title,
                'renter' => $booking->renter?->name,
                'start_date' => $booking->start_date?->toDateString(),
            ])
            ->values()
            ->all();

        return Inertia::render('Atelier/Inspections/Index', [
            'atelier' => ['id' => $atelier->id, 'business_name' => $atelier->business_name],
            'queue' => $queue,
        ]);
    }

    public function show(Atelier $atelier, Booking $booking): Response
    {
        $summary = $this->inspections->getBookingInspectionSummary($booking->id);

        return Inertia::render('Atelier/Inspections/Show', [
            'atelier' => ['id' => $atelier->id, 'business_name' => $atelier->business_name],
            'booking' => [
                'id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'status' => $booking->status->value,
                'start_date' => $booking->start_date?->toDateString(),
                'end_date' => $booking->end_date?->toDateString(),
            ],
            'summary' => $summary->toArray(),
        ]);
    }

    public function storePreDispatch(StoreInspectionRequest $request, Atelier $atelier, Booking $booking): RedirectResponse
    {
        $this->inspections->createPreDispatchReport(
            $booking->id,
            (int) $request->user()->id,
            $this->dtoFromRequest(InspectionPhase::PreDispatch->value, $request),
        );

        return redirect()->route('atelier.inspections.show', [$atelier, $booking])->with('success', 'Pre-dispatch baseline recorded.');
    }

    public function storePostReturn(StoreInspectionRequest $request, Atelier $atelier, Booking $booking): RedirectResponse
    {
        $this->inspections->createPostReturnReport(
            $booking->id,
            (int) $request->user()->id,
            $this->dtoFromRequest(InspectionPhase::PostReturn->value, $request),
        );

        return redirect()->route('atelier.inspections.show', [$atelier, $booking])->with('success', 'Post-return assessment recorded.');
    }

    public function finalize(FinalizeInspectionRequest $request, Atelier $atelier, InspectionReport $report): RedirectResponse
    {
        $this->inspections->finalizeInspection(
            $report->id,
            (int) $request->user()->id,
            $request->filled('override_deduction') ? Money::fromDecimal((float) $request->input('override_deduction'), 'EGP') : null,
        );

        return redirect()->route('atelier.inspections.show', [$atelier, $report->booking_id])->with('success', 'Inspection finalized and deposit settled.');
    }

    private function dtoFromRequest(string $phase, StoreInspectionRequest $request): CreateInspectionDTO
    {
        $items = [];

        foreach ((array) $request->input('damage_items', []) as $index => $item) {
            $items[] = new AddDamageItemDTO(
                location: (string) ($item['location'] ?? 'other'),
                damageType: (string) ($item['damage_type'] ?? 'other'),
                severity: (string) ($item['severity'] ?? 'minor'),
                description: $item['description'] ?? null,
                repairCost: (float) ($item['repair_cost'] ?? 0),
                deductionAmount: (float) ($item['deduction_amount'] ?? 0),
                photoFile: $request->file("damage_items.{$index}.photo"),
            );
        }

        return new CreateInspectionDTO(
            phase: $phase,
            conditionSummary: (string) $request->string('condition_summary'),
            damageDescription: $request->input('damage_description'),
            damageItems: $items,
        );
    }
}
