<?php

declare(strict_types=1);

namespace App\Modules\Availability\Http\Controllers\Storefront;

use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Domain\Exceptions\InvalidDateRangeException;
use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Availability\Http\Requests\ValidateRangeRequest;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AvailabilityQueryController extends Controller
{
    public function __construct(private readonly AvailabilityContract $availability) {}

    public function calendar(Dress $dress, Request $request): JsonResponse
    {
        $year = max(2000, min(2100, (int) $request->input('year', now()->year)));
        $month = max(1, min(12, (int) $request->input('month', now()->month)));

        return response()->json($this->availability->getMonthAvailabilityMap($dress->id, $year, $month));
    }

    public function validateRange(Dress $dress, ValidateRangeRequest $request): JsonResponse
    {
        try {
            $range = DateRange::between(
                $request->date('start_date'),
                $request->date('end_date'),
            );
        } catch (InvalidDateRangeException) {
            return response()->json([
                'dress_id' => $dress->id,
                'available' => false,
                'message' => 'The requested date range is invalid.',
            ], 422);
        }

        $maxDays = (int) config('availability.max_rental_days', 14);
        $rentalDays = $range->dayCount();

        if ($rentalDays > $maxDays) {
            return response()->json([
                'dress_id' => $dress->id,
                'start_date' => $range->startDate()->toDateString(),
                'end_date' => $range->endDate()->toDateString(),
                'rental_days' => $rentalDays,
                'buffer_days' => $this->availability->getBufferDays($dress->id),
                'available' => false,
                'message' => sprintf('Rental duration exceeds the maximum of %d days.', $maxDays),
            ]);
        }

        $available = $this->availability->checkRangeAvailability($dress->id, $range);

        return response()->json([
            'dress_id' => $dress->id,
            'start_date' => $range->startDate()->toDateString(),
            'end_date' => $range->endDate()->toDateString(),
            'rental_days' => $rentalDays,
            'buffer_days' => $this->availability->getBufferDays($dress->id),
            'available' => $available,
            'message' => $available ? 'Available' : 'The requested dates overlap an existing booking or its turnaround buffer.',
        ]);
    }
}
