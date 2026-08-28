<?php

declare(strict_types=1);

namespace Tests\Feature\Availability;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Domain\Exceptions\DressUnavailableException;
use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Availability\Infrastructure\Repositories\AvailabilityRepository;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Pessimistic locking guarantee: on MySQL (production) `lockForUpdate()` on the
 * dress row serializes concurrent attempts. These tests prove the invariant is
 * enforced regardless: overlapping attempts resolve to exactly one winner.
 */
class ConcurrencyBookingTest extends TestCase
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

    public function test_two_overlapping_requests_exactly_one_succeeds(): void
    {
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-10', '2026-10-12'), 'confirmed_booking', 1);

        try {
            $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-11', '2026-10-13'), 'confirmed_booking', 2);
            $this->fail('The second overlapping booking should have been rejected.');
        } catch (DressUnavailableException) {
            // expected
        }

        $this->assertSame(1, DB::table('dress_availabilities')
            ->where('dress_id', $this->dress->id)
            ->where('reason', 'confirmed_booking')
            ->count());
    }

    public function test_overlap_is_detected_within_the_same_transaction(): void
    {
        DB::beginTransaction();

        try {
            $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-20', '2026-10-22'), 'confirmed_booking', 5);

            $this->expectException(DressUnavailableException::class);
            $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-21', '2026-10-23'), 'confirmed_booking', 6);
        } finally {
            DB::rollBack();
        }
    }

    public function test_atomic_guard_rejects_when_hold_already_exists(): void
    {
        $repository = app(AvailabilityRepository::class);

        $first = $repository->insertHoldIfNoOverlap(
            $this->dress->id, '2026-11-01', '2026-11-03', '2026-11-05', 'confirmed_booking', 10, 'confirmed_booking',
        );
        $this->assertTrue($first);

        $second = $repository->insertHoldIfNoOverlap(
            $this->dress->id, '2026-11-01', '2026-11-03', '2026-11-05', 'confirmed_booking', 11, 'confirmed_booking',
        );
        $this->assertFalse($second);

        $this->assertSame(1, DB::table('dress_availabilities')
            ->where('dress_id', $this->dress->id)
            ->where('reason', 'confirmed_booking')
            ->count());
    }

    public function test_non_overlapping_requests_both_succeed(): void
    {
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-01', '2026-10-03'), 'confirmed_booking', 1);
        $this->availability()->lockDatesForBooking($this->dress->id, DateRange::between('2026-10-06', '2026-10-08'), 'confirmed_booking', 2);

        $this->assertSame(2, DB::table('dress_availabilities')
            ->where('dress_id', $this->dress->id)
            ->where('reason', 'confirmed_booking')
            ->count());
    }
}
