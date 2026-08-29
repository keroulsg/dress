<?php

declare(strict_types=1);

namespace App\Modules\Booking\Http\Controllers\Storefront;

use App\Modules\Availability\Domain\Exceptions\DressUnavailableException;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Exceptions\BookingCheckoutException;
use App\Modules\Booking\Http\Requests\CreateBookingRequest;
use App\Modules\Catalog\Domain\Contracts\CatalogReader;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Pricing\Application\DTOs\PricingCalculationDTO;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use App\Modules\Pricing\Domain\Exceptions\InvalidCouponException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class BookingCheckoutController extends Controller
{
    public function __construct(
        private readonly BookingOrchestratorContract $bookings,
        private readonly CatalogReader $catalog,
        private readonly PricingContract $pricing,
    ) {}

    public function show(Dress $dress): Response
    {
        if ($dress->status !== 'active') {
            abort(404);
        }

        $snapshot = $this->catalog->getDressSnapshot($dress->id);

        $breakdown = $this->pricing->calculateBookingTotal(new PricingCalculationDTO(
            renterId: auth()->id(),
            atelierId: $dress->atelier_id,
            items: [['dress_id' => $dress->id, 'daily_rate' => $snapshot->rentalPricePerDay->amount()]],
            startDate: now()->addDays(1),
            endDate: now()->addDays(3),
            rentalDays: 3,
            cleaningFee: $snapshot->cleaningFee->amount(),
            securityDeposit: $snapshot->securityDepositAmount->amount(),
            currency: $snapshot->rentalPricePerDay->currency(),
        ));

        return Inertia::render('Checkout/Index', [
            'dress' => [
                'id' => $dress->id,
                'title' => $dress->title,
                'slug' => $dress->slug,
                'atelier_id' => $dress->atelier_id,
                'primary_image' => $snapshot->primaryImagePath,
                'rental_price_per_day' => $snapshot->rentalPricePerDay->jsonSerialize(),
                'security_deposit_amount' => $snapshot->securityDepositAmount->jsonSerialize(),
                'cleaning_fee' => $snapshot->cleaningFee->jsonSerialize(),
                'late_fee_per_day' => $snapshot->lateFeePerDay->jsonSerialize(),
                'turnaround_buffer_days' => $snapshot->turnaroundBufferDays,
                'sizes' => $snapshot->availableSizes,
            ],
            'quote' => $breakdown,
        ]);
    }

    public function store(CreateBookingRequest $request, Dress $dress): RedirectResponse
    {
        try {
            $booking = $this->bookings->createBooking(new CreateBookingDTO(
                renterId: (int) $request->user()->id,
                atelierId: $dress->atelier_id,
                dressId: (int) $request->integer('dress_id'),
                dressSizeId: $request->filled('dress_size_id') ? (int) $request->integer('dress_size_id') : null,
                startDate: $request->date('start_date'),
                endDate: $request->date('end_date'),
                fittingDatetime: $request->filled('fitting_datetime') ? $request->date('fitting_datetime') : null,
                deliveryAddress: $request->input('delivery_address'),
                clientToken: $request->input('client_token'),
                couponCode: $request->input('coupon_code'),
            ));
        } catch (BookingCheckoutException $exception) {
            return back()->withErrors(['booking' => $exception->getMessage()]);
        } catch (DressUnavailableException) {
            return back()->withErrors(['booking' => 'The selected dates are no longer available. Please choose other dates.']);
        } catch (InvalidCouponException $exception) {
            return back()->withErrors(['coupon_code' => $exception->getMessage()]);
        }

        return redirect()->route('customer.bookings.show', $booking)->with('success', 'Booking created — complete payment to confirm.');
    }
}
