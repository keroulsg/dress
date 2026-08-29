<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Immutable summary of a booking's inspection state.
 */
final readonly class InspectionSummaryDTO
{
    /**
     * @param  array<string, mixed>|null  $preDispatchReport
     * @param  array<string, mixed>|null  $postReturnReport
     */
    public function __construct(
        public ?array $preDispatchReport,
        public ?array $postReturnReport,
        public Money $totalDeductions,
        public bool $isFinalized,
        public string $settlementStatus,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'pre_dispatch_report' => $this->preDispatchReport,
            'post_return_report' => $this->postReturnReport,
            'total_deductions' => $this->totalDeductions->jsonSerialize(),
            'is_finalized' => $this->isFinalized,
            'settlement_status' => $this->settlementStatus,
        ];
    }
}
