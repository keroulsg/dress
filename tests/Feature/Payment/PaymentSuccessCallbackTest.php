<?php

declare(strict_types=1);

namespace Tests\Feature\Payment;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Payment\Domain\Enums\TransactionStatus;
use App\Modules\Payment\Domain\Events\PaymentCaptured;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class PaymentSuccessCallbackTest extends TestCase
{
    use RefreshDatabase;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
        $category = CategoryFactory::new()->create();
        $dress = DressFactory::new()->active()->create([
            'atelier_id' => $atelier->id,
            'category_id' => $category->id,
            'rental_price_per_day' => 500,
            'cleaning_fee' => 150,
            'security_deposit_amount' => 2000,
        ]);

        $renter = UserFactory::new()->renter()->create();
        KycVerification::query()->create([
            'user_id' => $renter->id,
            'status' => 'approved',
            'document_type' => 'national_id',
            'front_path' => 'users/'.$renter->id.'/national_id/front.jpg',
        ]);

        $this->booking = app(BookingOrchestratorContract::class)->createBooking(new CreateBookingDTO(
            renterId: $renter->id,
            atelierId: $atelier->id,
            dressId: $dress->id,
            dressSizeId: null,
            startDate: now()->addDays(5),
            endDate: now()->addDays(7),
            deliveryAddress: '123 Main St',
            clientToken: 'cb-'.uniqid(),
        ));
    }

    public function test_success_callback_captures_and_confirms_booking(): void
    {
        Event::fake([PaymentCaptured::class]);

        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_3ds', 'http://localhost/cb', 'init-3ds');

        $transaction = app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'capture-3ds');

        $this->assertSame(TransactionStatus::Captured, $transaction->status);
        $this->assertSame(BookingStatus::Confirmed, $this->booking->fresh()->status);
        $this->assertDatabaseHas('dress_availabilities', [
            'reference_type' => 'confirmed_booking',
            'reference_id' => $this->booking->id,
        ]);

        Event::assertDispatched(PaymentCaptured::class);
    }

    public function test_duplicate_callback_does_not_create_duplicate_transactions(): void
    {
        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_3ds', 'http://localhost/cb', 'init-dup');

        app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'capture-dup');
        $second = app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'capture-dup');

        $this->assertSame(TransactionStatus::Captured, $second->status);
        $this->assertSame(1, Transaction::query()->where('type', 'rental_payment')->where('status', 'captured')->count());
    }

    public function test_payment_cancel_keeps_booking_pending(): void
    {
        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_3ds', 'http://localhost/cb', 'init-cancel');

        app(PaymentContract::class)->handlePaymentFailure((string) $session->gatewayReference, 'User cancelled');

        $rental = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'rental_payment')->first();
        $this->assertSame(TransactionStatus::Failed, $rental->status);
        $this->assertSame(BookingStatus::PendingPayment, $this->booking->fresh()->status);
    }
}
