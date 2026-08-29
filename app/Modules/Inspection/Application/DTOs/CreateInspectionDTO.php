<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Application\DTOs;

/**
 * Immutable input for creating an inspection report.
 *
 * @param  list<AddDamageItemDTO>  $damageItems
 */
final readonly class CreateInspectionDTO
{
    public function __construct(
        public string $phase,
        public string $conditionSummary,
        public ?string $damageDescription = null,
        public array $damageItems = [],
    ) {}
}
