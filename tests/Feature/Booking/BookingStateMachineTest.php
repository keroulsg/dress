<?php

declare(strict_types=1);

namespace Tests\Feature\Booking;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\Exceptions\InvalidBookingTransitionException;
use App\Modules\Booking\Infrastructure\Database\Factories\BookingFactory;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingStateMachineTest extends TestCase
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

    private function machine(): BookingOrchestratorContract
    {
        return app(BookingOrchestratorContract::class);
    }

    private function booking(BookingStatus $status = BookingStatus::PendingPayment): Booking
    {
        return BookingFactory::new()->create([
            'renter_id' => $this->renter->id,
            'atelier_id' => $this->atelier->id,
            'status' => $status,
        ]);
    }

    public function test_valid_state_progression(): void
    {
        $booking = $this->booking();

        $this->machine()->transitionStatus($booking->id, BookingStatus::Confirmed, ['actor_id' => null]);
        $this->machine()->transitionStatus($booking->id, BookingStatus::ReadyForDispatch, ['actor_id' => $this->owner->id]);
        $this->machine()->transitionStatus($booking->id, BookingStatus::Dispatched, ['actor_id' => $this->owner->id]);
        $this->machine()->transitionStatus($booking->id, BookingStatus::InCustomerPossession, ['actor_id' => $this->renter->id]);
        $this->machine()->transitionStatus($booking->id, BookingStatus::ReturnedPendingInspection, ['actor_id' => $this->owner->id]);
        $this->machine()->transitionStatus($booking->id, BookingStatus::InspectionCompleted, ['actor_id' => null]);
        $this->machine()->transitionStatus($booking->id, BookingStatus::Completed, ['actor_id' => null]);

        $this->assertSame(BookingStatus::Completed, $booking->fresh()->status);
    }

    public function test_illegal_state_jump_throws(): void
    {
        $booking = $this->booking();

        $this->expectException(InvalidBookingTransitionException::class);

        // pending_payment -> completed is not permitted.
        $this->machine()->transitionStatus($booking->id, BookingStatus::Completed, ['actor_id' => null]);
    }

    public function test_illegal_in_customer_possession_to_cancelled_is_rejected(): void
    {
        $booking = $this->booking(BookingStatus::InCustomerPossession);

        $this->expectException(InvalidBookingTransitionException::class);

        $this->machine()->transitionStatus($booking->id, BookingStatus::Cancelled, ['actor_id' => $this->renter->id]);
    }

    public function test_renter_cannot_mark_booking_as_dispatched(): void
    {
        $booking = $this->booking(BookingStatus::ReadyForDispatch);

        $this->expectException(AuthorizationException::class);

        // dispatched requires an atelier actor; a renter is denied.
        $this->machine()->transitionStatus($booking->id, BookingStatus::Dispatched, ['actor_id' => $this->renter->id]);
    }

    public function test_atelier_can_advance_ready_for_dispatch(): void
    {
        $booking = $this->booking(BookingStatus::ReadyForDispatch);

        $this->machine()->transitionStatus($booking->id, BookingStatus::Dispatched, ['actor_id' => $this->owner->id]);

        $this->assertSame(BookingStatus::Dispatched, $booking->fresh()->status);
        $this->assertNotNull($booking->fresh()->actual_dispatched_at);
    }

    public function test_dispatched_sets_receipt_timestamp_for_renter_confirmation(): void
    {
        $booking = $this->booking(BookingStatus::Dispatched);

        $this->machine()->transitionStatus($booking->id, BookingStatus::InCustomerPossession, ['actor_id' => $this->renter->id]);

        $this->assertSame(BookingStatus::InCustomerPossession, $booking->fresh()->status);
        $this->assertNotNull($booking->fresh()->actual_received_at);
    }
}
