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
use App\Modules\KYC\Domain\Contracts\KycContract;
use App\Modules\KYC\Domain\Entities\KycVerification;
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
        private readonly KycContract $kyc,
    ) {}

    public function show(Dress $dress): Response
    {
        if ($dress->status !== 'active') {
            abort(404);
        }

        $snapshot = $this->catalog->getDressSnapshot($dress->id);

        $mode = request()->query('mode', request()->query('order_type', ($dress->listing_mode === 'sell' || ! $dress->allows_rent) ? 'direct_sale' : 'rental'));
        $isDirectSale = ($mode === 'direct_sale' || $mode === 'sale' || $mode === 'buy');

        $rentalRate = (float) $snapshot->rentalPricePerDay->amount();
        $salePrice = (float) ($dress->original_retail_value ?: ($rentalRate * 5));
        $deposit = $isDirectSale ? 0.0 : (float) $snapshot->securityDepositAmount->amount();
        if (! $isDirectSale && $deposit <= 0) {
            $deposit = round($rentalRate * 0.25, 2);
        }

        $breakdown = $this->pricing->calculateBookingTotal(new PricingCalculationDTO(
            renterId: auth()->id() ?? 0,
            atelierId: $dress->atelier_id,
            items: [['dress_id' => $dress->id, 'daily_rate' => $isDirectSale ? number_format($salePrice, 2, '.', '') : $snapshot->rentalPricePerDay->amount()]],
            startDate: now()->addDays(1),
            endDate: now()->addDays(3),
            rentalDays: $isDirectSale ? 1 : 3,
            cleaningFee: $isDirectSale ? '0.00' : $snapshot->cleaningFee->amount(),
            securityDeposit: $deposit,
            currency: $snapshot->rentalPricePerDay->currency(),
            isDailyBilling: false,
        ));

        $user = auth()->user();
        $kycRecord = $user ? KycVerification::query()->where('user_id', $user->id)->latest()->first() : null;
        $isKycVerified = $kycRecord?->isApproved() ?? false;

        return Inertia::render('Checkout/Index', [
            'dress' => [
                'id' => $dress->id,
                'title' => $dress->title,
                'slug' => $dress->slug,
                'atelier_id' => $dress->atelier_id,
                'product_type' => $dress->product_type ?? 'dress',
                'listing_mode' => $dress->listing_mode ?? 'rent',
                'allows_rent' => (bool) ($dress->allows_rent ?? true),
                'allows_sale' => (bool) ($dress->allows_sale ?? false),
                'order_type' => $isDirectSale ? 'direct_sale' : 'rental',
                'primary_image' => $snapshot->primaryImagePath,
                'rental_price_per_day' => $snapshot->rentalPricePerDay->jsonSerialize(),
                'original_retail_value' => [
                    'amount' => number_format($salePrice, 2, '.', ''),
                    'currency' => $snapshot->rentalPricePerDay->currency(),
                ],
                'security_deposit_amount' => [
                    'amount' => number_format($deposit, 2, '.', ''),
                    'currency' => $snapshot->rentalPricePerDay->currency(),
                ],
                'cleaning_fee' => $isDirectSale ? ['amount' => '0.00', 'currency' => 'EGP'] : $snapshot->cleaningFee->jsonSerialize(),
                'late_fee_per_day' => $snapshot->lateFeePerDay->jsonSerialize(),
                'turnaround_buffer_days' => $snapshot->turnaroundBufferDays,
                'sizes' => $snapshot->availableSizes,
            ],
            'quote' => $breakdown,
            'user_kyc' => [
                'is_verified' => $isKycVerified,
                'status' => $kycRecord?->status?->value ?? 'unverified',
            ],
        ]);
    }

    public function store(CreateBookingRequest $request, Dress $dress): RedirectResponse
    {
        // In-Checkout KYC Upload: If customer uploads ID images, securely persist them
        if ($request->hasFile('id_front')) {
            try {
                $this->kyc->submitDocument(
                    userId: (int) $request->user()->id,
                    documentType: 'national_id',
                    frontFile: $request->file('id_front'),
                    backFile: $request->file('id_back'),
                );
            } catch (\Throwable) {
                // If KYC upload has an issue, log and continue booking in pending state
            }
        }

        try {
            $deliveryAddress = (string) $request->input('delivery_address');
            if ($request->filled('notes')) {
                $deliveryAddress .= ' [ملاحظات: '.$request->input('notes').']';
            }

            $sizeVal = $request->input('dress_size_id');
            $dressSizeId = is_numeric($sizeVal) && (int) $sizeVal > 0 ? (int) $sizeVal : null;
            if ($sizeVal && ! is_numeric($sizeVal)) {
                $deliveryAddress .= ' [المقاس: '.$sizeVal.']';
            }

            $orderType = (string) $request->input('order_type', ($dress->listing_mode === 'sell' || ! $dress->allows_rent) ? 'direct_sale' : 'rental');
            if ($orderType === 'direct_sale') {
                $deliveryAddress .= ' [نوع المعاملة: شراء وتملك فوري]';
            }

            $startDate = $request->filled('start_date') ? $request->date('start_date') : now();
            $endDate = $request->filled('end_date') ? $request->date('end_date') : now();

            $booking = $this->bookings->createBooking(new CreateBookingDTO(
                renterId: (int) $request->user()->id,
                atelierId: $dress->atelier_id,
                dressId: (int) $request->integer('dress_id'),
                dressSizeId: $dressSizeId,
                startDate: $startDate,
                endDate: $endDate,
                fittingDatetime: null,
                deliveryAddress: $deliveryAddress,
                clientToken: $request->input('client_token'),
                couponCode: $request->input('coupon_code'),
                isDailyBilling: false,
                orderType: $orderType,
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
