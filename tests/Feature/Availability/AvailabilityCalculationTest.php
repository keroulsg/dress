<?php

declare(strict_types=1);

namespace Tests\Feature\Availability;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Domain\Exceptions\DressUnavailableException;
use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AvailabilityCalculationTest extends TestCase
{
    use RefreshDatabase;

    private Dress $dress;

    protected function setUp(): void
    {
        parent::setUp();

        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
        $this->dress = DressFactory::new()->active()->create([
            'atelier_id' => $atelier->id,
            'turnaround_buffer_days' => 2,
        ]);
    }

    private function availability(): AvailabilityContract
    {
        return app(AvailabilityContract::class);
    }

    public function test_single_day_overlap_is_detected(): void
    {
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-01', '2026-10-01'), 'confirmed_booking', 1);

        // The same day is booked; Oct 2-3 are the cleaning buffer; Oct 4 is free.
        $this->assertFalse($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-10-01', '2026-10-01')));
        $this->assertFalse($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-10-02', '2026-10-02')));
        $this->assertTrue($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-10-04', '2026-10-04')));
    }

    public function test_multi_day_and_same_day_overlap(): void
    {
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-03', '2026-10-05'), 'confirmed_booking', 1);

        $this->assertFalse($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-10-05', '2026-10-06')));
        $this->assertFalse($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-09-30', '2026-10-04')));
        $this->assertFalse($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-10-06', '2026-10-07')));
        $this->assertTrue($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-10-08', '2026-10-08')));
    }

    public function test_buffer_days_block_subsequent_rental_starting_on_first_clean_day(): void
    {
        // Booking 1: Sep 1 - Sep 3, buffer 2 days => cleaning hold Sep 4 - Sep 5.
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-09-01', '2026-09-03'), 'confirmed_booking', 1);

        // Starting Sep 5 overlaps the cleaning buffer (Sep 4 - 5) => must FAIL.
        $this->assertFalse($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-09-05', '2026-09-07')));

        // Starting Sep 6 is after the buffer => must SUCCEED.
        $this->assertTrue($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-09-06', '2026-09-08')));
    }

    public function test_lock_dates_creates_confirmed_and_cleaning_holds(): void
    {
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-09-01', '2026-09-03'), 'confirmed_booking', 42);

        $this->assertDatabaseHas('dress_availabilities', [
            'dress_id' => $this->dress->id,
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-03',
            'reason' => 'confirmed_booking',
            'reference_id' => 42,
        ]);
        $this->assertDatabaseHas('dress_availabilities', [
            'dress_id' => $this->dress->id,
            'start_date' => '2026-09-04',
            'end_date' => '2026-09-05',
            'reason' => 'cleaning',
            'reference_id' => 42,
        ]);
    }

    public function test_same_reference_is_excluded_from_overlap_check(): void
    {
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-01', '2026-10-03'), 'confirmed_booking', 7);

        // Re-checking the same booking's own range (excluding its reference) reports available.
        $this->assertTrue($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-10-01', '2026-10-03'), 7));
    }

    public function test_release_removes_all_holds_for_reference(): void
    {
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-01', '2026-10-03'), 'confirmed_booking', 9);

        $this->assertTrue($this->availability()->releaseDatesForBooking('confirmed_booking', 9));

        $this->assertDatabaseMissing('dress_availabilities', ['reference_type' => 'confirmed_booking', 'reference_id' => 9]);
        $this->assertTrue($this->availability()->checkRangeAvailability($this->dress->id, DateRange::between('2026-10-01', '2026-10-03')));
    }

    public function test_overlapping_lock_throws_dress_unavailable(): void
    {
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-01', '2026-10-03'), 'confirmed_booking', 1);

        $this->expectException(DressUnavailableException::class);

        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-03', '2026-10-05'), 'confirmed_booking', 2);
    }

    public function test_month_map_classifies_booked_buffer_and_available(): void
    {
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-09-01', '2026-09-03'), 'confirmed_booking', 1);

        $map = $this->availability()->getMonthAvailabilityMap($this->dress->id, 2026, 9);

        $this->assertSame('booked', $map['days']['2026-09-01']['status']);
        $this->assertSame('buffer', $map['days']['2026-09-04']['status']);
        $this->assertSame('available', $map['days']['2026-09-06']['status']);
    }
}
