<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Console\Commands;

use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use Illuminate\Console\Command;

class ExpirePendingBookings extends Command
{
    protected $signature = 'bookings:expire-pending {--timeout=30}';

    protected $description = 'Expire pending-payment bookings and release their availability holds.';

    public function handle(BookingOrchestratorContract $bookings): int
    {
        $expired = $bookings->expirePendingBookings((int) $this->option('timeout'));

        $this->info(sprintf('Expired %d pending booking(s).', $expired));

        return self::SUCCESS;
    }
}
