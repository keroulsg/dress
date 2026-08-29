<?php

declare(strict_types=1);

namespace Tests\Feature\Availability;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\Inventory\Domain\Contracts\InventoryStateContract;
use App\Modules\Inventory\Domain\Enums\DressStatus;
use App\Modules\Inventory\Domain\Exceptions\InvalidInventoryTransitionException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryStateSyncTest extends TestCase
{
    use RefreshDatabase;

    private Dress $dress;

    protected function setUp(): void
    {
        parent::setUp();

        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
        $this->dress = DressFactory::new()->active()->create(['atelier_id' => $atelier->id]);
    }

    public function test_marking_for_maintenance_blocks_availability_calendar(): void
    {
        $inventory = app(InventoryStateContract::class);
        $availability = app(AvailabilityContract::class);

        $inventory->markForMaintenance(
            $this->dress->id,
            DateRange::between('2026-12-01', '2026-12-10'),
            'Broken zipper needs repair',
        );

        $this->assertSame(DressStatus::Maintenance->value, $this->dress->fresh()->status);

        $map = $availability->getMonthAvailabilityMap($this->dress->id, 2026, 12);
        $this->assertSame('maintenance', $map['days']['2026-12-01']['status']);
        $this->assertSame('maintenance', $map['days']['2026-12-10']['status']);
        $this->assertSame('available', $map['days']['2026-12-11']['status']);

        $this->assertFalse($availability->checkRangeAvailability($this->dress->id, DateRange::between('2026-12-05', '2026-12-06')));
    }

    public function test_completing_maintenance_releases_block_and_restores_active(): void
    {
        $inventory = app(InventoryStateContract::class);
        $availability = app(AvailabilityContract::class);

        $inventory->markForMaintenance($this->dress->id, DateRange::between('2026-12-01', '2026-12-10'), 'Repair hem');
        $inventory->completeMaintenance($this->dress->id);

        $this->assertSame(DressStatus::Active->value, $this->dress->fresh()->status);

        $map = $availability->getMonthAvailabilityMap($this->dress->id, 2026, 12);
        $this->assertSame('available', $map['days']['2026-12-01']['status']);

        $this->assertTrue($availability->checkRangeAvailability($this->dress->id, DateRange::between('2026-12-05', '2026-12-06')));
    }

    public function test_marking_for_cleaning_blocks_dates_and_sets_status(): void
    {
        $inventory = app(InventoryStateContract::class);
        $availability = app(AvailabilityContract::class);

        $inventory->markForCleaning($this->dress->id, 3);

        $this->assertSame(DressStatus::Cleaning->value, $this->dress->fresh()->status);

        $map = $availability->getMonthAvailabilityMap($this->dress->id, now()->year, now()->month);
        $today = now()->toDateString();
        $this->assertSame('buffer', $map['days'][$today]['status']);
    }

    public function test_invalid_transition_is_rejected(): void
    {
        $inventory = app(InventoryStateContract::class);

        // Draft -> Rented is not a permitted transition (Draft allows only
        // Active / Retired).
        $this->dress->update(['status' => 'draft']);

        $this->expectException(InvalidInventoryTransitionException::class);

        $inventory->transitionStatus($this->dress->id, DressStatus::Rented);
    }
}
