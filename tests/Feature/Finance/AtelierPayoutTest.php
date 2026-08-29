<?php

declare(strict_types=1);

namespace Tests\Feature\Finance;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Finance\Domain\Contracts\SettlementContract;
use App\Modules\Finance\Domain\Exceptions\InsufficientPayoutBalanceException;
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AtelierPayoutTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Atelier $atelier;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(FinanceSeeder::class);

        $this->owner = UserFactory::new()->atelierOwner()->create();
        $this->atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $this->owner->id, 'commission_rate' => 10.00]);
        $category = CategoryFactory::new()->create();
        $dress = DressFactory::new()->active()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $category->id,
            'rental_price_per_day' => 1000,
            'cleaning_fee' => 100,
            'security_deposit_amount' => 400,
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
            atelierId: $this->atelier->id,
            dressId: $dress->id,
            dressSizeId: null,
            startDate: now()->addDays(5),
            endDate: now()->addDays(6),
            deliveryAddress: '123 Main St',
            clientToken: 'fin-pay-'.uniqid(),
        ));
    }

    private function earnRent(): void
    {
        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'pay-init-'.uniqid());
        app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'pay-cap-'.uniqid());
    }

    public function test_atelier_cannot_request_payout_exceeding_available_balance(): void
    {
        $this->earnRent();

        $this->expectException(InsufficientPayoutBalanceException::class);

        app(SettlementContract::class)->createPayout(
            $this->atelier->id,
            Money::fromDecimal(99999, 'EGP'),
            'PAY-X-'.uniqid(),
        );
    }

    public function test_payout_approval_posts_balanced_clearing_and_marks_paid(): void
    {
        $this->earnRent();

        $payout = app(SettlementContract::class)->createPayout(
            $this->atelier->id,
            Money::fromDecimal(900, 'EGP'),
            'PAY-OK-'.uniqid(),
        );

        $transaction = Transaction::query()->create([
            'booking_id' => null,
            'user_id' => $this->owner->id,
            'atelier_id' => $this->atelier->id,
            'type' => 'atelier_payout',
            'amount' => $payout->amount,
            'currency' => $payout->currency,
            'payment_method' => 'bank_transfer',
            'status' => 'captured',
            'idempotency_key' => 'payout-tx-'.$payout->id,
        ]);

        app(SettlementContract::class)->processPayout($payout, $transaction);

        $this->assertSame('paid', $payout->fresh()->status);
        $this->assertTrue(app(LedgerContract::class)->verifyLedgerBalance($transaction->id));
    }

    public function test_available_balance_is_derived_from_ledger_payable(): void
    {
        $this->earnRent();

        // Rental 1000 × 2 days = 2000; cleaning 100; deposit 400.
        // Net rent credit 2020 = 2000 − 200 commission (10%) = 1800.
        $available = app(LedgerContract::class)->getAtelierAvailableBalance($this->atelier->id);

        $this->assertSame('1800.0000', $available->amount());
    }
}
