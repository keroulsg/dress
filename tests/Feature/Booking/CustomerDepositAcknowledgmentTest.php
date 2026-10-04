<?php

declare(strict_types=1);

namespace Tests\Feature\Booking;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Infrastructure\Database\Factories\BookingFactory;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerDepositAcknowledgmentTest extends TestCase
{
    use RefreshDatabase;

    private User $renter;

    private User $otherUser;

    private Atelier $atelier;

    protected function setUp(): void
    {
        parent::setUp();

        $this->renter = UserFactory::new()->renter()->create();
        $this->otherUser = UserFactory::new()->renter()->create();
        $owner = UserFactory::new()->atelierOwner()->create();
        $this->atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
    }

    public function test_renter_can_acknowledge_deposit_receipt_and_complete_booking(): void
    {
        $booking = BookingFactory::new()->create([
            'renter_id' => $this->renter->id,
            'atelier_id' => $this->atelier->id,
            'status' => BookingStatus::ReturnedPendingInspection,
            'security_deposit_amount' => '1500.00',
            'deposit_refunded_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($this->renter)->post(
            route('customer.bookings.acknowledgeDeposit', $booking)
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $fresh = $booking->fresh();
        $this->assertNotNull($fresh->deposit_acknowledged_at);
        $this->assertSame(BookingStatus::Completed, $fresh->status);
    }

    public function test_non_owner_cannot_acknowledge_deposit_receipt(): void
    {
        $booking = BookingFactory::new()->create([
            'renter_id' => $this->renter->id,
            'atelier_id' => $this->atelier->id,
            'status' => BookingStatus::ReturnedPendingInspection,
            'security_deposit_amount' => '1500.00',
            'deposit_refunded_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($this->otherUser)->post(
            route('customer.bookings.acknowledgeDeposit', $booking)
        );

        $response->assertForbidden();

        $fresh = $booking->fresh();
        $this->assertNull($fresh->deposit_acknowledged_at);
        $this->assertNotSame(BookingStatus::Completed, $fresh->status);
    }

    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $booking = BookingFactory::new()->create([
            'renter_id' => $this->renter->id,
            'atelier_id' => $this->atelier->id,
            'status' => BookingStatus::ReturnedPendingInspection,
        ]);

        $response = $this->post(route('customer.bookings.acknowledgeDeposit', $booking));

        $response->assertRedirect(route('login'));
    }
}
