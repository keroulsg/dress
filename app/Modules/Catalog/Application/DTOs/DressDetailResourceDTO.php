<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Storefront dress detail view model.
 */
final readonly class DressDetailResourceDTO
{
    /**
     * @param  list<array{id: int, path: string, thumbnail: string|null, alt: string|null, is_primary: bool, display_order: int}>  $images
     * @param  list<array{size_code: string, bust: string|null, waist: string|null, hips: string|null, length: string|null, is_available: bool}>  $sizes
     * @param  array{business_name: string, city: string|null, rating_average: string|null, is_approved: bool}  $atelier
     * @param  array{count: int, average: string|null}  $reviewSummary
     */
    public function __construct(
        public int $id,
        public string $slug,
        public string $title,
        public string $description,
        public string $fabricType,
        public string $silhouette,
        public string $colorPrimary,
        public Money $originalRetailValue,
        public Money $rentalPricePerDay,
        public Money $securityDepositAmount,
        public Money $cleaningFee,
        public Money $lateFeePerDay,
        public int $turnaroundBufferDays,
        public string $conditionRating,
        public string $status,
        public array $images,
        public array $sizes,
        public array $atelier,
        public array $reviewSummary,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,
            'fabric_type' => $this->fabricType,
            'silhouette' => $this->silhouette,
            'color_primary' => $this->colorPrimary,
            'original_retail_value' => $this->originalRetailValue->jsonSerialize(),
            'rental_price_per_day' => $this->rentalPricePerDay->jsonSerialize(),
            'security_deposit_amount' => $this->securityDepositAmount->jsonSerialize(),
            'cleaning_fee' => $this->cleaningFee->jsonSerialize(),
            'late_fee_per_day' => $this->lateFeePerDay->jsonSerialize(),
            'turnaround_buffer_days' => $this->turnaroundBufferDays,
            'condition_rating' => $this->conditionRating,
            'status' => $this->status,
            'images' => $this->images,
            'sizes' => $this->sizes,
            'atelier' => $this->atelier,
            'review_summary' => $this->reviewSummary,
        ];
    }
}
