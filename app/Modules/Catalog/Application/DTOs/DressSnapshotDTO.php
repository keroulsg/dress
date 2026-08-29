<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Immutable snapshot of a dress used by other modules.
 */
final readonly class DressSnapshotDTO
{
    /**
     * @param  list<string>  $availableSizes
     */
    public function __construct(
        public int $dressId,
        public int $atelierId,
        public string $title,
        public string $slug,
        public string $status,
        public Money $rentalPricePerDay,
        public Money $securityDepositAmount,
        public Money $cleaningFee,
        public Money $lateFeePerDay,
        public Money $originalRetailValue,
        public int $turnaroundBufferDays,
        public array $availableSizes,
        public ?string $primaryImagePath = null,
    ) {}
}
