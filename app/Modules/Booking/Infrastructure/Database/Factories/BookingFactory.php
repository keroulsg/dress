<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Database\Factories;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $rentalDays = 3;
        $unitPrice = fake()->randomFloat(2, 100, 8000);
        $rentalRateTotal = round($unitPrice * $rentalDays, 2);
        $cleaningFeeTotal = round(fake()->randomFloat(2, 50, 200), 2);
        $taxAmount = round($rentalRateTotal * 0.15, 2);
        $startDate = fake()->dateTimeBetween('now', '+3 months');
        $endDate = (clone $startDate)->modify('+2 days');

        return [
            'booking_reference' => Str::upper(fake()->unique()->bothify('BK-####-####')),
            'renter_id' => User::factory(),
            'atelier_id' => Atelier::factory(),
            'fitting_datetime' => null,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'actual_dispatched_at' => null,
            'actual_received_at' => null,
            'actual_returned_at' => null,
            'rental_days_count' => $rentalDays,
            'rental_rate_total' => $rentalRateTotal,
            'cleaning_fee_total' => $cleaningFeeTotal,
            'security_deposit_amount' => round($rentalRateTotal * 0.5, 2),
            'late_fee_total' => 0.00,
            'discount_amount' => 0.00,
            'tax_amount' => $taxAmount,
            'grand_total' => round($rentalRateTotal + $cleaningFeeTotal + $taxAmount, 2),
            'deposit_held' => 0.00,
            'deposit_refunded' => 0.00,
            'deposit_deducted' => 0.00,
            'currency' => 'SAR',
            'status' => fake()->randomElement(BookingStatus::cases()),
            'cancellation_reason' => null,
            'cancelled_at' => null,
            'cancelled_by' => null,
        ];
    }

    public function pendingPayment(): static
    {
        return $this->state(fn (): array => ['status' => BookingStatus::PendingPayment]);
    }

    public function confirmed(): static
    {
        return $this->state(fn (): array => ['status' => BookingStatus::Confirmed]);
    }

    public function dispatched(): static
    {
        return $this->state(fn (): array => [
            'status' => BookingStatus::Dispatched,
            'actual_dispatched_at' => now(),
        ]);
    }

    public function returnedPendingInspection(): static
    {
        return $this->state(fn (): array => [
            'status' => BookingStatus::ReturnedPendingInspection,
            'actual_returned_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => BookingStatus::Completed,
            'deposit_refunded' => $attributes['security_deposit_amount'],
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (): array => [
            'status' => BookingStatus::Cancelled,
            'cancelled_at' => now(),
        ]);
    }
}
