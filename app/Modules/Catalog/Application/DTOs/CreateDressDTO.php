<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Application\DTOs;

use Illuminate\Http\UploadedFile;

/**
 * Immutable input for creating a dress within an atelier scope.
 */
final readonly class CreateDressDTO
{
    /**
     * @param  list<array{size_code: string, bust?: float|string|null, waist?: float|string|null, hips?: float|string|null, length?: float|string|null, is_available?: bool}>  $sizes
     * @param  list<UploadedFile>  $images
     */
    public function __construct(
        public string $title,
        public int $categoryId,
        public ?string $description = null,
        public ?string $fabricType = null,
        public ?string $silhouette = null,
        public ?string $colorPrimary = null,
        public float|int|string $originalRetailValue = 0,
        public float|int|string $rentalPricePerDay = 0,
        public float|int|string $securityDepositAmount = 0,
        public float|int|string $cleaningFee = 0,
        public float|int|string $lateFeePerDay = 0,
        public int $turnaroundBufferDays = 2,
        public string $conditionRating = 'good',
        public array $sizes = [],
        public array $images = [],
    ) {}
}
