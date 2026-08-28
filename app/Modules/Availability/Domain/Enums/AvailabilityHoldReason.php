<?php

declare(strict_types=1);

namespace App\Modules\Availability\Domain\Enums;

/**
 * Allowed values for the reference_type column of availability holds.
 * Mirrors config('availability.hold_reference_types').
 */
enum AvailabilityHoldReason: string
{
    case ConfirmedBooking = 'confirmed_booking';
    case RentalHold = 'rental_hold';
    case Fitting = 'fitting';
    case InTransit = 'in_transit';
    case Cleaning = 'cleaning';
    case Alteration = 'alteration';
    case Maintenance = 'maintenance';
    case ManualBlock = 'manual_block';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $case): string => $case->value,
            self::cases(),
        );
    }

    public static function isValid(string $value): bool
    {
        return in_array($value, self::values(), true);
    }
}
