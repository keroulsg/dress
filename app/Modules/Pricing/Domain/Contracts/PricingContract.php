<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Domain\Contracts;

use App\Modules\Pricing\Application\DTOs\PricingBreakdownDTO;
use App\Modules\Pricing\Application\DTOs\PricingCalculationDTO;

/**
 * Public contract for the Pricing module.
 *
 * Pricing is the single source of truth for rental calculations, fees,
 * discounts, taxes, and deposit math. Frontend totals are display-only; the
 * backend recalculates before any payment is captured.
 */
interface PricingContract
{
    public function calculateBookingTotal(PricingCalculationDTO $dto): PricingBreakdownDTO;

    /**
     * Quotes the late fee for a returned rental, based on the configured
     * per-day late fee and the number of late calendar days.
     */
    public function quoteLateFees(int $lateDays, float|int|string $lateFeePerDay, string $currency = 'EGP'): PricingBreakdownDTO;
}
