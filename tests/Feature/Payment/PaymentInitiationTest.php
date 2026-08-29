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
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Payment\Domain\Enums\TransactionStatus;
use App\Modules\Payment\Domain\Exceptions\PaymentStateException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentInitiationTest extends TestCase
{
    use RefreshDatabase;

    private User $renter;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(FinanceSeeder::class);

        $this->seed(FinanceSeeder::class);
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

        $this->renter = UserFactory::new()->renter()->create();
        KycVerification::query()->create([
            'user_id' => $this->renter->id,
            'status' => 'approved',
            'document_type' => 'national_id',
            'front_path' => 'users/'.$this->renter->id.'/national_id/front.jpg',
        ]);

        $this->booking = app(BookingOrchestratorContract::class)->createBooking(new CreateBookingDTO(
            renterId: $this->renter->id,
            atelierId: $atelier->id,
            dressId: $dress->id,
            dressSizeId: null,
            startDate: now()->addDays(5),
            endDate: now()->addDays(7),
            deliveryAddress: '123 Main St',
            clientToken: 'pay-init-'.uniqid(),
        ));
    }

    public function test_initiate_payment_creates_rental_and_deposit_transactions(): void
    {
        $session = app(PaymentContract::class)->initiateBookingPayment(
            $this->booking->id,
            'mock_card_success',
            'http://localhost/callback',
            'init-token-'.uniqid(),
        );

        $this->assertSame('approved', $session->status);

        $rental = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'rental_payment')->first();
        $this->assertNotNull($rental);
        $this->assertSame(TransactionStatus::Authorized, $rental->status);
        $this->assertSame('1881.00', $rental->amount);

        $deposit = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'deposit_authorization')->first();
        $this->assertNotNull($deposit);
        $this->assertSame(TransactionStatus::Authorized, $deposit->status);
        $this->assertSame('2000.00', $deposit->amount);
    }

    public function test_initiate_payment_is_idempotent_per_token(): void
    {
        $token = 'same-init-token';

        $first = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', $token);
        $second = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', $token);

        $this->assertTrue($second->isReplay);
        $this->assertSame($first->transactionId, $second->transactionId);
        $this->assertSame(1, Transaction::query()->where('type', 'rental_payment')->count());
    }

    public function test_paying_confirmed_booking_is_rejected(): void
    {
        // Complete the payment to move to confirmed.
        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'init-a');
        app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'capture-a');

        $this->assertSame(BookingStatus::Confirmed, $this->booking->fresh()->status);

        $this->expectException(PaymentStateException::class);

        app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'init-b');
    }

    public function test_declined_card_returns_declined_session(): void
    {
        $session = app(PaymentContract::class)->initiateBookingPayment(
            $this->booking->id,
            'mock_card_declined',
            'http://localhost/callback',
            'declined-token',
        );

        $this->assertSame('declined', $session->status);

        $rental = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'rental_payment')->first();
        $this->assertSame(TransactionStatus::Initiated, $rental->status);
    }
}
