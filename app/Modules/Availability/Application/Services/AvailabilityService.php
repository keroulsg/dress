<?php

declare(strict_types=1);

namespace App\Modules\Availability\Application\Services;

use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Domain\Entities\DressAvailability;
use App\Modules\Availability\Domain\Enums\AvailabilityHoldReason;
use App\Modules\Availability\Domain\Exceptions\DressUnavailableException;
use App\Modules\Availability\Domain\Exceptions\InvalidDateRangeException;
use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Availability\Infrastructure\Repositories\AvailabilityRepository;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AvailabilityService implements AvailabilityContract
{
    public function __construct(
        private readonly AvailabilityRepository $repository,
    ) {}

    public function checkRangeAvailability(int $dressId, DateRange $range, ?int $excludeReferenceId = null): bool
    {
        $buffer = $this->repository->bufferDaysFor($dressId);
        $effectiveEnd = $range->endDate()->addDays($buffer)->toDateString();

        $overlapping = $this->repository->overlappingHolds(
            $dressId,
            $range->startDate()->toDateString(),
            $effectiveEnd,
            $excludeReferenceId,
        );

        return $overlapping === [];
    }

    public function lockDatesForBooking(int $dressId, DateRange $range, string $referenceType, int $referenceId, string $reason = 'confirmed_booking'): DressAvailability
    {
        $this->assertValidReason($reason);

        return DB::transaction(function () use ($dressId, $range, $referenceType, $referenceId, $reason): DressAvailability {
            $this->repository->lockDressRow($dressId);

            $buffer = $this->repository->bufferDaysFor($dressId);
            $effectiveEnd = $range->endDate()->addDays($buffer)->toDateString();

            $inserted = $this->repository->insertHoldIfNoOverlap(
                dressId: $dressId,
                startDate: $range->startDate()->toDateString(),
                endDate: $range->endDate()->toDateString(),
                effectiveEndDate: $effectiveEnd,
                referenceType: $referenceType,
                referenceId: $referenceId,
                reason: $reason,
            );

            if (! $inserted) {
                throw DressUnavailableException::forDress($dressId, $range);
            }

            if ($buffer > 0) {
                $this->repository->insertHold(
                    dressId: $dressId,
                    startDate: $range->endDate()->addDay()->toDateString(),
                    endDate: $effectiveEnd,
                    referenceType: $referenceType,
                    referenceId: $referenceId,
                    reason: AvailabilityHoldReason::Cleaning->value,
                );
            }

            return $this->repository->holdForReference($referenceType, $referenceId, $reason)
                ?? throw DressUnavailableException::forDress($dressId, $range);
        });
    }

    public function releaseDatesForBooking(string $referenceType, int $referenceId): bool
    {
        return $this->repository->deleteHoldsForReference($referenceType, $referenceId) > 0;
    }

    public function getBufferDays(int $dressId): int
    {
        return $this->repository->bufferDaysFor($dressId);
    }

    public function createOperationalBlock(int $dressId, DateRange $range, string $reason, ?string $notes = null): DressAvailability
    {
        $this->assertValidReason($reason);

        if ($range->startDate()->lt(now()->startOfDay())) {
            throw InvalidDateRangeException::startInPast();
        }

        $this->repository->insertHold(
            dressId: $dressId,
            startDate: $range->startDate()->toDateString(),
            endDate: $range->endDate()->toDateString(),
            referenceType: $reason,
            referenceId: $dressId,
            reason: $reason,
            notes: $notes,
        );

        return $this->repository->holdForReference($reason, $dressId, $reason)
            ?? throw new InvalidArgumentException(sprintf('Operational block "%s" was not persisted.', $reason));
    }

    public function getMonthAvailabilityMap(int $dressId, int $year, int $month): array
    {
        $monthStart = sprintf('%04d-%02d-01', $year, $month);
        $monthEnd = date('Y-m-t', strtotime($monthStart));

        $holds = $this->repository->holdsInRange($dressId, $monthStart, $monthEnd);

        $days = [];
        $cursor = CarbonImmutable::parse($monthStart);
        $lastDay = CarbonImmutable::parse($monthEnd);

        while ($cursor->lte($lastDay)) {
            $days[$cursor->toDateString()] = ['status' => 'available'];
            $cursor = $cursor->addDay();
        }

        $ordered = $holds;
        usort($ordered, fn (array $a, array $b): int => $this->priorityForReason($a['reason']) <=> $this->priorityForReason($b['reason']));

        foreach ($ordered as $hold) {
            $start = max($monthStart, (string) $hold['start_date']);
            $end = min($monthEnd, (string) $hold['end_date']);

            $day = CarbonImmutable::parse($start);

            while ($day->toDateString() <= $end) {
                $days[$day->toDateString()] = [
                    'status' => $this->statusForReason((string) $hold['reason']),
                    'type' => (string) $hold['reason'],
                ];
                $day = $day->addDay();
            }
        }

        return [
            'dress_id' => $dressId,
            'month' => sprintf('%04d-%02d', $year, $month),
            'buffer_days' => $this->repository->bufferDaysFor($dressId),
            'days' => $days,
        ];
    }

    private function priorityForReason(string $reason): int
    {
        return match ($reason) {
            'manual_block' => 1,
            'maintenance' => 2,
            'confirmed_booking', 'rental_hold' => 3,
            'fitting', 'in_transit' => 4,
            'cleaning', 'alteration' => 5,
            default => 6,
        };
    }

    private function statusForReason(string $reason): string
    {
        return match ($reason) {
            'confirmed_booking', 'rental_hold' => 'booked',
            'cleaning', 'alteration' => 'buffer',
            'maintenance' => 'maintenance',
            'manual_block' => 'manual_block',
            default => 'unavailable',
        };
    }

    private function assertValidReason(string $reason): void
    {
        if (! AvailabilityHoldReason::isValid($reason)) {
            throw new InvalidArgumentException(sprintf('Unknown availability hold reason "%s".', $reason));
        }
    }
}
