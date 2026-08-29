<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Application\DTOs;

use Illuminate\Http\UploadedFile;

/**
 * Immutable damage item entry with optional evidence photo.
 */
final readonly class AddDamageItemDTO
{
    public function __construct(
        public string $location,
        public string $damageType,
        public string $severity,
        public ?string $description = null,
        public float|int|string $repairCost = 0,
        public float|int|string $deductionAmount = 0,
        public ?UploadedFile $photoFile = null,
    ) {}
}
