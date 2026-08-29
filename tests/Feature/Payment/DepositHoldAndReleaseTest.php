<?php

declare(strict_types=1);

namespace Tests\Feature\Payment;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Payment\Domain\Enums\TransactionStatus;
use App\Modules\Payment\Domain\Enums\TransactionType;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepositHoldAndReleaseTest extends TestCase
{
    use RefreshDatabase;

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
            clientToken: 'deposit-'.uniqid(),
        ));
    }

    public function test_deposit_is_pre_authorized_at_initiation(): void
    {
        app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'init-dep');

        $deposit = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'deposit_authorization')->first();

        $this->assertNotNull($deposit);
        $this->assertSame(TransactionStatus::Authorized, $deposit->status);
        $this->assertSame('2000.00', $deposit->amount);
    }

    public function test_deposit_penalty_is_captured_on_damage(): void
    {
        app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'init-pen');

        app(PaymentContract::class)->processDepositSettlement(
            $this->booking->id,
            Money::fromDecimal(2000, 'EGP'),
            Money::fromDecimal(500, 'EGP'),
            Money::fromDecimal(1500, 'EGP'),
            'settlement-pen',
        );

        $this->assertDatabaseHas('transactions', [
            'booking_id' => $this->booking->id,
            'type' => TransactionType::DepositPenalty->value,
            'status' => TransactionStatus::Captured->value,
            'amount' => '500.00',
        ]);
        $this->assertDatabaseHas('transactions', [
            'booking_id' => $this->booking->id,
            'type' => TransactionType::DepositRelease->value,
            'status' => TransactionStatus::Voided->value,
        ]);
    }

    public function test_clean_return_releases_full_deposit(): void
    {
        app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'init-clean');

        app(PaymentContract::class)->processDepositSettlement(
            $this->booking->id,
            Money::fromDecimal(2000, 'EGP'),
            Money::fromDecimal(0, 'EGP'),
            Money::fromDecimal(2000, 'EGP'),
            'settlement-clean',
        );

        $deposit = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'deposit_authorization')->first();
        $this->assertSame(TransactionStatus::Voided, $deposit->status);

        $this->assertDatabaseHas('transactions', [
            'booking_id' => $this->booking->id,
            'type' => TransactionType::DepositRelease->value,
            'amount' => '2000.00',
        ]);
    }

    public function test_deposit_settlement_is_idempotent(): void
    {
        app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'init-idem');

        app(PaymentContract::class)->processDepositSettlement($this->booking->id, Money::fromDecimal(2000, 'EGP'), Money::fromDecimal(0, 'EGP'), Money::fromDecimal(2000, 'EGP'), 'settle-x');
        app(PaymentContract::class)->processDepositSettlement($this->booking->id, Money::fromDecimal(2000, 'EGP'), Money::fromDecimal(0, 'EGP'), Money::fromDecimal(2000, 'EGP'), 'settle-x');

        $this->assertSame(1, Transaction::query()->where('type', 'deposit_release')->count());
    }
}
