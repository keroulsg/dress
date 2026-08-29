<?php

declare(strict_types=1);

namespace Tests\Feature\Booking;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Domain\Entities\DressAvailability;
use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class BookingCancellationTest extends TestCase
{
    use RefreshDatabase;

    private User $renter;

    private Dress $dress;

    protected function setUp(): void
    {
        parent::setUp();

        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
        $category = CategoryFactory::new()->create();
        $this->dress = DressFactory::new()->active()->create([
            'atelier_id' => $atelier->id,
            'category_id' => $category->id,
            'turnaround_buffer_days' => 2,
        ]);

        $this->renter = UserFactory::new()->renter()->create();
        KycVerification::query()->create([
            'user_id' => $this->renter->id,
            'status' => 'approved',
            'document_type' => 'national_id',
            'front_path' => 'users/'.$this->renter->id.'/national_id/front.jpg',
        ]);
    }

    private function createBooking(): Booking
    {
        return app(BookingOrchestratorContract::class)->createBooking(new CreateBookingDTO(
            renterId: $this->renter->id,
            atelierId: $this->dress->atelier_id,
            dressId: $this->dress->id,
            dressSizeId: null,
            startDate: now()->addDays(5),
            endDate: now()->addDays(7),
            deliveryAddress: '123 Main St',
            clientToken: 'cancel-token-'.uniqid(),
        ));
    }

    public function test_cancelling_releases_availability_holds_immediately(): void
    {
        $booking = $this->createBooking();
        $range = DateRange::between($booking->start_date, $booking->end_date);

        $this->assertGreaterThan(0, DressAvailability::query()->where('reference_id', $booking->id)->count());

        app(BookingOrchestratorContract::class)->cancelBooking($booking->id, $this->renter->id, 'Changed my mind');

        $this->assertSame(BookingStatus::Cancelled, $booking->fresh()->status);
        $this->assertSame(0, DressAvailability::query()->where('reference_id', $booking->id)->count());
        $this->assertTrue(app(AvailabilityContract::class)->checkRangeAvailability($this->dress->id, $range));
    }

    public function test_expire_pending_command_frees_unpaid_dates(): void
    {
        $booking = $this->createBooking();

        // Simulate a stale unpaid booking created 40 minutes ago.
        Booking::query()->whereKey($booking->id)->update(['created_at' => now()->subMinutes(40)]);

        Artisan::call('bookings:expire-pending', ['--timeout' => 30]);

        $this->assertSame(BookingStatus::Expired, $booking->fresh()->status);
        $this->assertSame(0, DressAvailability::query()->where('reference_id', $booking->id)->count());
        $this->assertDatabaseHas('audit_logs', ['action' => 'booking.status_changed', 'auditable_id' => $booking->id]);
    }

    public function test_recent_pending_bookings_are_not_expired(): void
    {
        $booking = $this->createBooking();

        Artisan::call('bookings:expire-pending', ['--timeout' => 30]);

        $this->assertSame(BookingStatus::PendingPayment, $booking->fresh()->status);
    }
}
