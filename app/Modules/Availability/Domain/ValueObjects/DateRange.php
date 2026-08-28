<?php

declare(strict_types=1);

namespace App\Modules\Availability\Domain\ValueObjects;

use App\Modules\Availability\Domain\Exceptions\InvalidDateRangeException;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use JsonSerializable;

/**
 * Immutable inclusive date range owned by the Availability module.
 *
 * Rental dates are calendar dates in the application timezone; they are
 * intentionally not converted between timezones.
 */
final readonly class DateRange implements JsonSerializable
{
    private function __construct(
        private CarbonImmutable $startDate,
        private CarbonImmutable $endDate,
    ) {}

    public static function between(DateTimeInterface|string $startDate, DateTimeInterface|string $endDate): self
    {
        $start = CarbonImmutable::parse($startDate)->startOfDay();
        $end = CarbonImmutable::parse($endDate)->startOfDay();

        if ($end->lt($start)) {
            throw InvalidDateRangeException::endBeforeStart();
        }

        return new self($start, $end);
    }

    public function startDate(): CarbonImmutable
    {
        return $this->startDate;
    }

    public function endDate(): CarbonImmutable
    {
        return $this->endDate;
    }

    /**
     * Number of inclusive calendar days the range covers (min 1).
     */
    public function dayCount(): int
    {
        return (int) $this->startDate->diffInDays($this->endDate->addDay());
    }

    public function overlaps(self $other): bool
    {
        return $this->startDate->lte($other->endDate) && $this->endDate->gte($other->startDate);
    }

    /**
     * Expands the range by a buffer of days on both ends.
     */
    public function withBuffer(int $bufferDays): self
    {
        if ($bufferDays < 0) {
            throw InvalidDateRangeException::negativeBuffer();
        }

        return new self(
            $this->startDate->subDays($bufferDays),
            $this->endDate->addDays($bufferDays),
        );
    }

    public function jsonSerialize(): array
    {
        return [
            'start_date' => $this->startDate->toDateString(),
            'end_date' => $this->endDate->toDateString(),
            'day_count' => $this->dayCount(),
        ];
    }
}
