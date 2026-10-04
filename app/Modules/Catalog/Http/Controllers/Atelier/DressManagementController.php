<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Controllers\Atelier;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Catalog\Application\DTOs\CreateDressDTO;
use App\Modules\Catalog\Application\DTOs\UpdateDressDTO;
use App\Modules\Catalog\Domain\Contracts\CatalogReader;
use App\Modules\Catalog\Domain\Contracts\DressManagementContract;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Enums\EgyptianGovernorate;
use App\Modules\Catalog\Http\Requests\StoreDressRequest;
use App\Modules\Catalog\Http\Requests\UpdateDressRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DressManagementController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly DressManagementContract $management,
        private readonly CatalogReader $catalog,
    ) {}

    public function index(Atelier $atelier): Response
    {
        $status = request()->query('status');
        $result = $this->catalog->listAtelierDresses($atelier->id, is_string($status) ? $status : null, 12, max(1, (int) request()->query('page', 1)));

        return Inertia::render('Atelier/Dresses/Index', [
            'atelier' => ['id' => $atelier->id, 'business_name' => $atelier->business_name],
            'dresses' => $result['dresses'],
            'pagination' => $result['pagination'],
            'status' => $status,
        ]);
    }

    public function create(Atelier $atelier): Response
    {
        return Inertia::render('Atelier/Dresses/Create', [
            'atelier' => [
                'id' => $atelier->id,
                'business_name' => $atelier->business_name,
                'city' => $atelier->city,
                'governorate' => $atelier->governorate,
            ],
            'categories' => $this->catalog->getActiveCategories(),
            'governorates' => EgyptianGovernorate::options(),
        ]);
    }

    public function store(StoreDressRequest $request, Atelier $atelier): RedirectResponse
    {
        $dto = new CreateDressDTO(
            title: (string) $request->string('title'),
            categoryId: (int) $request->integer('category_id'),
            description: $request->input('description'),
            fabricType: $request->input('fabric_type'),
            silhouette: $request->input('silhouette'),
            colorPrimary: $request->input('color_primary'),
            governorate: $request->filled('governorate') ? (string) $request->input('governorate') : null,
            city: $request->filled('city') ? (string) $request->input('city') : null,
            availableForIntercityShipping: $request->boolean('available_for_intercity_shipping', true),
            originalRetailValue: (float) ($request->input('original_retail_value', 0)),
            rentalPricePerDay: (float) ($request->input('rental_price_per_day', 0)),
            securityDepositAmount: (float) ($request->input('security_deposit_amount', 0)),
            cleaningFee: (float) ($request->input('cleaning_fee', 0)),
            lateFeePerDay: (float) ($request->input('late_fee_per_day', 0)),
            turnaroundBufferDays: (int) $request->integer('turnaround_buffer_days', 2),
            conditionRating: (string) $request->input('condition_rating', 'good'),
            listingMode: (string) $request->input('listing_mode', 'rent'),
            productType: (string) ($request->input('product_type') ?: 'dress'),
            sizes: (array) $request->input('sizes', []),
            images: $request->file('images', []),
            publishNow: $request->boolean('publish_now', false),
        );

        $this->management->createDress($atelier->id, $dto);

        $message = $dto->publishNow ? 'تم نشر الفستان في المتجر بنجاح.' : 'تم حفظ الفستان كمسودة.';

        return redirect()->route('atelier.dresses.index', $atelier)->with('success', $message);
    }

    public function edit(Atelier $atelier, Dress $dress): Response
    {
        $this->authorize('update', $dress);

        return Inertia::render('Atelier/Dresses/Edit', [
            'atelier' => [
                'id' => $atelier->id,
                'business_name' => $atelier->business_name,
                'city' => $atelier->city,
                'governorate' => $atelier->governorate,
            ],
            'categories' => $this->catalog->getActiveCategories(),
            'governorates' => EgyptianGovernorate::options(),
            'dress' => [
                'id' => $dress->id,
                'title' => $dress->title,
                'category_id' => $dress->category_id,
                'product_type' => $dress->product_type ?? 'dress',
                'governorate' => $dress->governorate,
                'city' => $dress->city,
                'available_for_intercity_shipping' => (bool) $dress->available_for_intercity_shipping,
                'allows_rent' => (bool) $dress->allows_rent,
                'allows_sale' => (bool) $dress->allows_sale,
                'description' => $dress->description,
                'fabric_type' => $dress->fabric_type,
                'silhouette' => $dress->silhouette,
                'color_primary' => $dress->color_primary,
                'original_retail_value' => $dress->original_retail_value,
                'rental_price_per_day' => $dress->rental_price_per_day,
                'security_deposit_amount' => $dress->security_deposit_amount,
                'cleaning_fee' => $dress->cleaning_fee,
                'late_fee_per_day' => $dress->late_fee_per_day,
                'turnaround_buffer_days' => $dress->turnaround_buffer_days,
                'condition_rating' => $dress->condition_rating,
                'listing_mode' => $dress->listing_mode ?? 'rent',
                'status' => $dress->status,
                'sizes' => $dress->sizes->map(fn ($size): array => [
                    'id' => $size->id,
                    'size_code' => $size->size_code,
                    'bust' => $size->bust,
                    'waist' => $size->waist,
                    'hips' => $size->hips,
                    'length' => $size->length,
                    'is_available' => (bool) $size->is_available,
                ])->values()->all(),
                'images' => $dress->images->sortBy('display_order')->map(fn ($image): array => [
                    'id' => $image->id,
                    'path' => $image->image_path,
                    'thumbnail' => $image->thumbnail_path,
                    'is_primary' => (bool) $image->is_primary,
                    'alt_text' => $image->alt_text,
                ])->values()->all(),
            ],
        ]);
    }

    public function update(UpdateDressRequest $request, Atelier $atelier, Dress $dress): RedirectResponse
    {
        $dto = new UpdateDressDTO(
            title: $request->input('title'),
            categoryId: $request->filled('category_id') ? (int) $request->integer('category_id') : null,
            description: $request->input('description'),
            fabricType: $request->input('fabric_type'),
            silhouette: $request->input('silhouette'),
            colorPrimary: $request->input('color_primary'),
            governorate: $request->has('governorate') ? $request->input('governorate') : null,
            city: $request->has('city') ? $request->input('city') : null,
            availableForIntercityShipping: $request->has('available_for_intercity_shipping') ? $request->boolean('available_for_intercity_shipping') : null,
            originalRetailValue: $request->filled('original_retail_value') ? (float) $request->input('original_retail_value') : null,
            rentalPricePerDay: $request->filled('rental_price_per_day') ? (float) $request->input('rental_price_per_day') : null,
            securityDepositAmount: $request->filled('security_deposit_amount') ? (float) $request->input('security_deposit_amount') : null,
            cleaningFee: $request->filled('cleaning_fee') ? (float) $request->input('cleaning_fee') : null,
            lateFeePerDay: $request->filled('late_fee_per_day') ? (float) $request->input('late_fee_per_day') : null,
            turnaroundBufferDays: $request->filled('turnaround_buffer_days') ? (int) $request->integer('turnaround_buffer_days') : null,
            conditionRating: $request->input('condition_rating'),
            listingMode: $request->input('listing_mode'),
            productType: $request->input('product_type'),
            sizes: (array) $request->input('sizes', []),
            images: $request->file('images', []),
            publishNow: $request->has('publish_now') ? $request->boolean('publish_now') : null,
        );

        $this->management->updateDress($dress->id, $dto);

        return redirect()->route('atelier.dresses.index', $atelier)->with('success', 'Dress updated.');
    }

    public function togglePublish(Atelier $atelier, Dress $dress): RedirectResponse
    {
        $this->authorize('update', $dress);

        if ($dress->status === 'active') {
            $this->management->archiveDress($dress->id);
        } else {
            $this->management->publishDress($dress->id);
        }

        return back()->with('success', 'Dress publication state updated.');
    }

    public function destroy(Atelier $atelier, Dress $dress): RedirectResponse
    {
        $this->authorize('delete', $dress);

        $this->management->deleteDress($dress->id);

        return redirect()->route('atelier.dresses.index', $atelier)->with('success', 'Dress deleted.');
    }
}
