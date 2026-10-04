<?php

declare(strict_types=1);

namespace Tests\Feature\Booking;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Infrastructure\Database\Factories\BookingFactory;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepositReturnEnforcementTest extends TestCase
{
    use RefreshDatabase;

    private User $renter;

    private User $owner;

    private Atelier $atelier;

    protected function setUp(): void
    {
        parent::setUp();

        $this->renter = UserFactory::new()->renter()->create();
        $this->owner = UserFactory::new()->atelierOwner()->create();
        $this->atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $this->owner->id]);
    }

    public function test_atelier_can_confirm_deposit_refund_and_complete_booking(): void
    {
        $booking = BookingFactory::new()->create([
            'renter_id' => $this->renter->id,
            'atelier_id' => $this->atelier->id,
            'status' => BookingStatus::ReturnedPendingInspection,
            'returned_at' => now()->subHours(2),
            'security_deposit_amount' => '1500.00',
        ]);

        $response = $this->actingAs($this->owner)->post(
            route('atelier.bookings.confirmDepositRefunded', [$this->atelier, $booking])
        );

        $response->assertRedirect();
        $fresh = $booking->fresh();
        $this->assertSame(BookingStatus::Completed, $fresh->status);
        $this->assertNotNull($fresh->deposit_refunded_at);
    }

    public function test_atelier_can_file_damage_claim_and_open_dispute(): void
    {
        $booking = BookingFactory::new()->create([
            'renter_id' => $this->renter->id,
            'atelier_id' => $this->atelier->id,
            'status' => BookingStatus::ReturnedPendingInspection,
            'returned_at' => now()->subHours(2),
            'security_deposit_amount' => '1500.00',
        ]);

        $response = $this->actingAs($this->owner)->post(
            route('atelier.bookings.fileDamageClaim', [$this->atelier, $booking]),
            [
                'damage_description' => 'Tear in lower lace hemlines requiring re-stitching',
                'repair_cost' => '400',
            ]
        );

        $response->assertRedirect();
        $fresh = $booking->fresh();
        $this->assertSame(BookingStatus::Disputed, $fresh->status);
        $this->assertTrue((bool) $fresh->deposit_disputed);
    }

    public function test_customer_flagging_withheld_deposit_freezes_store_payouts(): void
    {
        $booking = BookingFactory::new()->create([
            'renter_id' => $this->renter->id,
            'atelier_id' => $this->atelier->id,
            'status' => BookingStatus::ReturnedPendingInspection,
            'returned_at' => now()->subHours(30),
            'security_deposit_amount' => '2000.00',
        ]);

        $this->assertFalse($this->atelier->fresh()->isPayoutBlocked());

        $response = $this->actingAs($this->renter)->post(
            route('customer.bookings.flagDepositWithheld', $booking)
        );

        $response->assertRedirect();

        $freshAtelier = $this->atelier->fresh();
        $this->assertTrue($freshAtelier->isPayoutBlocked());
        $this->assertTrue((bool) $booking->fresh()->deposit_disputed);
        $this->assertSame(BookingStatus::Disputed, $booking->fresh()->status);
    }

    public function test_auto_resolve_command_resolves_stale_returned_bookings(): void
    {
        $staleBooking = BookingFactory::new()->create([
            'renter_id' => $this->renter->id,
            'atelier_id' => $this->atelier->id,
            'status' => BookingStatus::ReturnedPendingInspection,
            'returned_at' => now()->subHours(26),
            'security_deposit_amount' => '1000.00',
            'deposit_disputed' => false,
        ]);

        $recentBooking = BookingFactory::new()->create([
            'renter_id' => $this->renter->id,
            'atelier_id' => $this->atelier->id,
            'status' => BookingStatus::ReturnedPendingInspection,
            'returned_at' => now()->subHours(5),
            'security_deposit_amount' => '1000.00',
            'deposit_disputed' => false,
        ]);

        $this->artisan('bookings:auto-resolve-returned --hours=24')
            ->expectsOutputToContain('Auto-resolved 1 returned booking(s)')
            ->assertSuccessful();

        $this->assertSame(BookingStatus::Completed, $staleBooking->fresh()->status);
        $this->assertNotNull($staleBooking->fresh()->deposit_refunded_at);

        // Recent booking within 24h remains untouched
        $this->assertSame(BookingStatus::ReturnedPendingInspection, $recentBooking->fresh()->status);
    }
}
