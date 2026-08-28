<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Storefront catalog card view model.
 */
final readonly class DressCardResourceDTO
{
    /**
     * @param  list<string>  $availableSizes
     */
    public function __construct(
        public int $id,
        public string $slug,
        public string $title,
        public int $atelierId,
        public string $atelierName,
        public string $categoryName,
        public Money $rentalPricePerDay,
        public Money $securityDepositAmount,
        public ?string $primaryImagePath,
        public ?string $thumbnailPath,
        public string $status,
        public string $conditionRating,
        public array $availableSizes,
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
            'atelier_id' => $this->atelierId,
            'atelier_name' => $this->atelierName,
            'category_name' => $this->categoryName,
            'rental_price_per_day' => $this->rentalPricePerDay->jsonSerialize(),
            'security_deposit_amount' => $this->securityDepositAmount->jsonSerialize(),
            'primary_image_path' => $this->primaryImagePath,
            'thumbnail_path' => $this->thumbnailPath,
            'status' => $this->status,
            'condition_rating' => $this->conditionRating,
            'available_sizes' => $this->availableSizes,
        ];
    }
}
