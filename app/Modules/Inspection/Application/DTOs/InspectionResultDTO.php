<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Immutable result of a finalized inspection report.
 */
final readonly class InspectionResultDTO
{
    public function __construct(
        public int $reportId,
        public int $bookingId,
        public string $phase,
        public string $conditionSummary,
        public Money $recommendedDeduction,
        public Money $approvedDeduction,
        public bool $customerApproved,
        public ?string $damageDescription = null,
    ) {}
}
