<?php

namespace App\Modules\Storefront\Application\Services;

use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Catalog\Domain\Entities\Dress;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class StorefrontSearchService
{
    public function __construct(
        private readonly AvailabilityContract $availability,
    ) {}

    public function search(array $filters = []): LengthAwarePaginator
    {
        $query = Dress::query()
            ->with(['atelier', 'category', 'images', 'sizes'])
            ->where('status', 'active');

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['category'])) {
            $cat = (string) $filters['category'];
            if ($cat === 'wedding-evening-gowns') {
                $query->whereHas('category', fn (Builder $q) => $q->whereIn('slug', [
                    'wedding-evening-gowns',
                    'evening-soiree',
                    'bridal',
                    'engagement',
                    'vintage-couture',
                ])->orWhere('id', 5));
            } else {
                $query->whereHas('category', fn (Builder $q) => $q->where('slug', $cat)->orWhere('id', $cat));
            }
        }

        if (! empty($filters['product_type'])) {
            $query->where('product_type', $filters['product_type']);
        }

        if (! empty($filters['mode'])) {
            if ($filters['mode'] === 'sale') {
                $query->where('allows_sale', true);
            } elseif ($filters['mode'] === 'rent') {
                $query->where('allows_rent', true);
            }
        }

        if (! empty($filters['size'])) {
            $query->whereHas('sizes', function (Builder $q) use ($filters) {
                $q->where('size_code', $filters['size'])
                    ->where('is_available', true);
            });
        }

        if (! empty($filters['min_price'])) {
            $query->where('rental_price_per_day', '>=', $filters['min_price']);
        }

        if (! empty($filters['max_price'])) {
            $query->where('rental_price_per_day', '<=', $filters['max_price']);
        }

        if (! empty($filters['start_date']) && ! empty($filters['end_date'])) {
            $startDate = Carbon::parse($filters['start_date']);
            $endDate = Carbon::parse($filters['end_date']);

            // Exclude dresses that are unavailable in this range
            $query->where(function (Builder $q) use ($startDate, $endDate) {
                // Fetch dress IDs that are available.
                // A scalable production system might use a DB join, but we use the domain contract.
                $availableDressIds = [];
                // Actually, querying the contract for ALL published dresses is O(N).
                // Let's filter out ones that have conflicting bookings directly via relationship to be performant.
                $q->whereDoesntHave('bookingItems.booking', function (Builder $bookingQ) use ($startDate, $endDate) {
                    $bookingQ->whereNotIn('status', ['cancelled', 'rejected'])
                        ->where(function ($dateQ) use ($startDate, $endDate) {
                            $dateQ->whereBetween('start_date', [$startDate, $endDate])
                                ->orWhereBetween('end_date', [$startDate, $endDate])
                                ->orWhere(function ($wrapQ) use ($startDate, $endDate) {
                                    $wrapQ->where('start_date', '<', $startDate)
                                        ->where('end_date', '>', $endDate);
                                });
                        });
                });
            });
        }

        $sort = $filters['sort'] ?? 'recommended';

        match ($sort) {
            'price_asc' => $query->orderBy('rental_price_per_day', 'asc'),
            'price_desc' => $query->orderBy('rental_price_per_day', 'desc'),
            'newest' => $query->orderBy('published_at', 'desc'),
            default => $query->orderBy('rating_average', 'desc')->orderBy('rating_count', 'desc'), // recommended
        };

        return $query->paginate($filters['per_page'] ?? 24);
    }
}
