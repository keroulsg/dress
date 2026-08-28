<?php

declare(strict_types=1);

namespace App\Modules\Finance\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * A single double-entry journal posting line.
 */
final readonly class LedgerEntryDTO
{
    public function __construct(
        public string $accountCode,
        public Money $amount,
        public bool $isDebit,
        public string $description = '',
    ) {}
}
