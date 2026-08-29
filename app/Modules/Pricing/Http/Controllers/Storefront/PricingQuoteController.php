<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Http\Controllers\Storefront;

use App\Modules\Catalog\Domain\Contracts\CatalogReader;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Pricing\Application\DTOs\PricingCalculationDTO;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use App\Modules\Pricing\Domain\Exceptions\InvalidCouponException;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use App\Modules\Pricing\Http\Requests\CalculateQuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class PricingQuoteController extends Controller
{
    public function __construct(
        private readonly PricingContract $pricing,
        private readonly CatalogReader $catalog,
    ) {}

    public function quote(CalculateQuoteRequest $request): JsonResponse
    {
        $dress = Dress::query()->find($request->integer('dress_id'));

        if ($dress === null) {
            return response()->json(['message' => 'Dress not found.'], 422);
        }

        $snapshot = $this->catalog->getDressSnapshot($dress->id);
        $start = $request->date('start_date');
        $end = $request->date('end_date');
        $days = (int) $start->diffInDays($end) + 1;

        try {
            $breakdown = $this->pricing->calculateBookingTotal(new PricingCalculationDTO(
                renterId: (int) ($request->user()?->id ?? 0),
                atelierId: $dress->atelier_id,
                items: [['dress_id' => $dress->id, 'daily_rate' => $snapshot->rentalPricePerDay->amount()]],
                startDate: $start,
                endDate: $end,
                rentalDays: $days,
                cleaningFee: $snapshot->cleaningFee->amount(),
                securityDeposit: $snapshot->securityDepositAmount->amount(),
                couponCode: $request->input('coupon_code'),
                includeDelivery: (bool) $request->boolean('delivery_requested'),
                deliveryCity: $request->input('delivery_city'),
                currency: $snapshot->rentalPricePerDay->currency(),
            ));
        } catch (InvalidCouponException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json($breakdown->toArray());
    }

    public function validateCoupon(CalculateQuoteRequest $request): JsonResponse
    {
        $dress = Dress::query()->find($request->integer('dress_id'));

        if ($dress === null) {
            return response()->json(['message' => 'Dress not found.'], 422);
        }

        $snapshot = $this->catalog->getDressSnapshot($dress->id);
        $start = $request->date('start_date');
        $end = $request->date('end_date');
        $days = (int) $start->diffInDays($end) + 1;

        $subtotal = Money::fromDecimal($snapshot->rentalPricePerDay->amount(), $snapshot->rentalPricePerDay->currency())
            ->multiply($days);

        $discount = $this->pricing->validateCoupon(
            (string) $request->string('coupon_code'),
            (int) ($request->user()?->id ?? 0),
            $subtotal,
        );

        if ($discount === null) {
            return response()->json(['valid' => false, 'message' => 'This coupon is invalid, expired, or not applicable.']);
        }

        return response()->json(['valid' => true, ...$discount->toArray()]);
    }
}
