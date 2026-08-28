<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Database\Seeders;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Availability\Domain\Entities\DressAvailability;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Entities\BookingItem;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Identity\Domain\Entities\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $renters = User::query()->where('role', 'renter')->orderBy('id')->get();
        $ateliers = Atelier::query()->orderBy('id')->get();
        $dresses = Dress::query()->where('status', 'active')->orderBy('id')->get();

        $scenarios = [
            ['status' => 'confirmed', 'offset' => 7],
            ['status' => 'confirmed', 'offset' => 14],
            ['status' => 'fitting_scheduled', 'offset' => 10],
            ['status' => 'in_customer_possession', 'offset' => -2],
            ['status' => 'in_customer_possession', 'offset' => -4],
            ['status' => 'returned_pending_inspection', 'offset' => -7],
            ['status' => 'returned_pending_inspection', 'offset' => -8],
            ['status' => 'completed', 'offset' => -14],
            ['status' => 'completed', 'offset' => -21],
            ['status' => 'cancelled', 'offset' => -30],
        ];

        foreach ($scenarios as $index => $scenario) {
            $renter = $renters[$index % $renters->count()];
            $atelier = $ateliers[$index % $ateliers->count()];
            $dress = $dresses[$index % $dresses->count()];

            $startDate = CarbonImmutable::today()->addDays($scenario['offset']);
            $endDate = $startDate->addDays(2);
            $days = 3;

            $rentalRate = (float) $dress->rental_price_per_day * $days;
            $cleaningFee = (float) $dress->cleaning_fee;
            $deposit = (float) $dress->security_deposit_amount;
            $tax = $rentalRate * 0.14;
            $grandTotal = $rentalRate + $cleaningFee + $tax + $deposit;

            $status = $scenario['status'];

            $booking = Booking::query()->create([
                'booking_reference' => 'BK-2026-'.strtoupper(Str::random(6)),
                'renter_id' => $renter->id,
                'atelier_id' => $atelier->id,
                'fitting_datetime' => $status === 'fitting_scheduled'
                    ? $startDate->subDays(3)->setTime(16, 0)
                    : null,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'actual_dispatched_at' => in_array($status, ['in_customer_possession', 'returned_pending_inspection', 'completed'], true)
                    ? $startDate->subDay()->setTime(12, 0)
                    : null,
                'actual_received_at' => in_array($status, ['returned_pending_inspection', 'completed'], true)
                    ? $endDate->addDay()->setTime(12, 0)
                    : null,
                'actual_returned_at' => null,
                'rental_days_count' => $days,
                'rental_rate_total' => number_format($rentalRate, 2, '.', ''),
                'cleaning_fee_total' => number_format($cleaningFee, 2, '.', ''),
                'security_deposit_amount' => number_format($deposit, 2, '.', ''),
                'late_fee_total' => '0.00',
                'discount_amount' => '0.00',
                'tax_amount' => number_format($tax, 2, '.', ''),
                'grand_total' => number_format($grandTotal, 2, '.', ''),
                'deposit_held' => number_format($deposit, 2, '.', ''),
                'deposit_refunded' => $status === 'completed' ? number_format($deposit, 2, '.', '') : '0.00',
                'deposit_deducted' => '0.00',
                'currency' => 'SAR',
                'status' => $status,
                'cancellation_reason' => $status === 'cancelled' ? 'Customer changed plans' : null,
                'cancelled_at' => $status === 'cancelled' ? $startDate->subDay() : null,
                'cancelled_by' => $status === 'cancelled' ? $renter->id : null,
            ]);

            BookingItem::query()->create([
                'booking_id' => $booking->id,
                'dress_id' => $dress->id,
                'quantity' => 1,
                'unit_rental_price' => number_format((float) $dress->rental_price_per_day, 2, '.', ''),
                'rental_days' => $days,
                'subtotal' => number_format($rentalRate, 2, '.', ''),
            ]);

            if (in_array($status, ['confirmed', 'fitting_scheduled', 'in_customer_possession', 'returned_pending_inspection'], true)) {
                DressAvailability::query()->create([
                    'dress_id' => $dress->id,
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString(),
                    'reason' => 'confirmed_booking',
                    'reference_type' => 'booking',
                    'reference_id' => $booking->id,
                ]);
            }
        }

        $this->command?->info('Bookings seeded: 10 bookings across confirmed, dispatched, returned, completed, and cancelled states.');
    }
}
