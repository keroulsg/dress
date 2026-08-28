<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Http\Controllers\Atelier;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Domain\Enums\AvailabilityHoldReason;
use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Inventory\Domain\Contracts\InventoryStateContract;
use App\Modules\Inventory\Http\Requests\BlockDatesRequest;
use App\Modules\Inventory\Http\Requests\CleaningRequest;
use App\Modules\Inventory\Http\Requests\MaintenanceRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;

class InventoryManagementController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly InventoryStateContract $inventory,
        private readonly AvailabilityContract $availability,
    ) {}

    public function blockDates(Atelier $atelier, Dress $dress, BlockDatesRequest $request): RedirectResponse
    {
        $this->authorize('update', $dress);

        $range = DateRange::between($request->date('start_date'), $request->date('end_date'));

        $this->availability->createOperationalBlock(
            $dress->id,
            $range,
            AvailabilityHoldReason::ManualBlock->value,
            $request->input('notes'),
        );

        return back()->with('success', 'Dates blocked.');
    }

    public function sendToCleaning(Atelier $atelier, Dress $dress, CleaningRequest $request): RedirectResponse
    {
        $this->authorize('update', $dress);

        $this->inventory->markForCleaning($dress->id, (int) $request->integer('days'));

        return back()->with('success', 'Garment sent to dry cleaning.');
    }

    public function startMaintenance(Atelier $atelier, Dress $dress, MaintenanceRequest $request): RedirectResponse
    {
        $this->authorize('update', $dress);

        $range = DateRange::between($request->date('start_date'), $request->date('end_date'));

        $this->inventory->markForMaintenance($dress->id, $range, (string) $request->string('issue_description'));

        return back()->with('success', 'Garment moved to maintenance and dates blocked.');
    }

    public function completeMaintenance(Atelier $atelier, Dress $dress): RedirectResponse
    {
        $this->authorize('update', $dress);

        $this->inventory->completeMaintenance($dress->id);

        return back()->with('success', 'Maintenance completed; garment is available again.');
    }
}
