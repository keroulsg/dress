<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\Services;

use App\Modules\Pricing\Application\DTOs\PricingBreakdownDTO;
use App\Modules\Pricing\Application\DTOs\PricingCalculationDTO;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use App\Modules\Pricing\Domain\Exceptions\InvalidQuoteRequestException;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Server-side pricing authority. All rental calculations, taxes, fees, and
 * deposit math flow through this service. Frontend totals are display-only.
 */
class PricingService implements PricingContract
{
    public function __construct(
        private readonly string $currency,
        private readonly float $taxRate,
    ) {}

    public function calculateBookingTotal(PricingCalculationDTO $dto): PricingBreakdownDTO
    {
        if ($dto->rentalDays < 1) {
            throw InvalidQuoteRequestException::nonPositiveRentalDays();
        }

        if ($dto->items === []) {
            throw InvalidQuoteRequestException::emptyItems();
        }

        $subtotal = Money::zero($dto->currency);

        foreach ($dto->items as $item) {
            $dailyRate = Money::fromDecimal((float) $item['daily_rate'], $dto->currency);
            $subtotal = $subtotal->add($dailyRate->multiply($dto->rentalDays));
        }

        $cleaningFee = Money::fromDecimal($dto->cleaningFee, $dto->currency);
        $discount = Money::fromDecimal($dto->discountAmount, $dto->currency);
        $deposit = Money::fromDecimal($dto->securityDeposit, $dto->currency);

        $netSubtotal = $subtotal->subtract($discount);
        $tax = $netSubtotal->multiply($this->taxRate);

        $grandTotal = $netSubtotal
            ->add($cleaningFee)
            ->add($tax)
            ->add($deposit);

        $amountChargeable = $grandTotal->subtract($deposit);

        return new PricingBreakdownDTO(
            rentalSubtotal: $subtotal,
            cleaningFee: $cleaningFee,
            taxAmount: $tax,
            discountAmount: $discount,
            securityDeposit: $deposit,
            grandTotal: $grandTotal,
            amountChargeable: $amountChargeable,
            rentalDays: $dto->rentalDays,
            currency: $dto->currency,
        );
    }

    public function quoteLateFees(int $lateDays, float|int|string $lateFeePerDay, string $currency = 'EGP'): PricingBreakdownDTO
    {
        if ($lateDays < 0) {
            throw InvalidQuoteRequestException::negativeLateDays();
        }

        $lateFeeTotal = Money::fromDecimal($lateFeePerDay, $currency)->multiply($lateDays);

        return new PricingBreakdownDTO(
            rentalSubtotal: $lateFeeTotal,
            cleaningFee: Money::zero($currency),
            taxAmount: Money::zero($currency),
            discountAmount: Money::zero($currency),
            securityDeposit: Money::zero($currency),
            grandTotal: $lateFeeTotal,
            amountChargeable: $lateFeeTotal,
            rentalDays: $lateDays,
            currency: $currency,
        );
    }
}
