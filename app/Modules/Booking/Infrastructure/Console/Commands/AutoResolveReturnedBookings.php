<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Console\Commands;

use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use Illuminate\Console\Command;

class AutoResolveReturnedBookings extends Command
{
    protected $signature = 'bookings:auto-resolve-returned {--hours=24}';

    protected $description = 'Auto-resolve returned bookings idle past 24h inspection window and release deposits.';

    public function handle(BookingOrchestratorContract $bookings): int
    {
        $hours = (int) $this->option('hours');
        $cutoff = now()->subHours($hours);

        $staleBookings = Booking::query()
            ->where('status', BookingStatus::ReturnedPendingInspection->value)
            ->where(function ($q) use ($cutoff) {
                $q->where('returned_at', '<=', $cutoff)
                    ->orWhere('actual_returned_at', '<=', $cutoff);
            })
            ->where('deposit_disputed', false)
            ->get();

        $resolvedCount = 0;

        foreach ($staleBookings as $booking) {
            $booking->deposit_refunded_at = now();
            $booking->save();

            $bookings->transitionStatus(
                $booking->id,
                BookingStatus::Completed,
                ['actor_id' => null, 'reason' => "Auto-resolved after {$hours}h inspection window without dispute. Deposit released."]
            );

            $resolvedCount++;
        }

        $this->info(sprintf('Auto-resolved %d returned booking(s) past the %d-hour window.', $resolvedCount, $hours));

        return self::SUCCESS;
    }
}
