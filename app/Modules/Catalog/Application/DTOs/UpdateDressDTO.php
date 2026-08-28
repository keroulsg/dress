<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Application\DTOs;

use Illuminate\Http\UploadedFile;

/**
 * Immutable input for updating a dress. Only the provided fields are changed.
 */
final readonly class UpdateDressDTO
{
    /**
     * @param  list<array{size_code: string, bust?: float|string|null, waist?: float|string|null, hips?: float|string|null, length?: float|string|null, is_available?: bool}>  $sizes
     * @param  list<UploadedFile>  $images
     */
    public function __construct(
        public ?string $title = null,
        public ?int $categoryId = null,
        public ?string $description = null,
        public ?string $fabricType = null,
        public ?string $silhouette = null,
        public ?string $colorPrimary = null,
        public float|int|string|null $originalRetailValue = null,
        public float|int|string|null $rentalPricePerDay = null,
        public float|int|string|null $securityDepositAmount = null,
        public float|int|string|null $cleaningFee = null,
        public float|int|string|null $lateFeePerDay = null,
        public ?int $turnaroundBufferDays = null,
        public ?string $conditionRating = null,
        public array $sizes = [],
        public array $images = [],
    ) {}

    public function toArray(): array
    {
        return array_filter([
            'title' => $this->title,
            'category_id' => $this->categoryId,
            'description' => $this->description,
            'fabric_type' => $this->fabricType,
            'silhouette' => $this->silhouette,
            'color_primary' => $this->colorPrimary,
            'original_retail_value' => $this->originalRetailValue,
            'rental_price_per_day' => $this->rentalPricePerDay,
            'security_deposit_amount' => $this->securityDepositAmount,
            'cleaning_fee' => $this->cleaningFee,
            'late_fee_per_day' => $this->lateFeePerDay,
            'turnaround_buffer_days' => $this->turnaroundBufferDays,
            'condition_rating' => $this->conditionRating,
        ], fn ($value): bool => $value !== null);
    }
}
