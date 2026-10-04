<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Console\Commands;

use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use Illuminate\Console\Command;

class ReleaseUnpaidHoldsCommand extends Command
{
    protected $signature = 'bookings:release-unpaid-holds {--minutes=30}';

    protected $description = 'Release holds for unpaid bookings older than 30 minutes and free stock/calendar slots.';

    public function handle(BookingOrchestratorContract $bookings): int
    {
        $minutes = (int) $this->option('minutes');
        $expired = $bookings->expirePendingBookings($minutes);

        $this->info(sprintf('Released %d unpaid booking hold(s) older than %d minutes.', $expired, $minutes));

        return self::SUCCESS;
    }
}
