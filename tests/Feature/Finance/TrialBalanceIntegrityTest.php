<?php

declare(strict_types=1);

namespace Tests\Feature\Finance;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Finance\Domain\Contracts\SettlementContract;
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrialBalanceIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_global_trial_balance_balances_after_full_financial_cycle(): void
    {
        $this->seed(FinanceSeeder::class);

        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id, 'commission_rate' => 10.00]);
        $category = CategoryFactory::new()->create();
        $dress = DressFactory::new()->active()->create([
            'atelier_id' => $atelier->id,
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

        $booking = app(BookingOrchestratorContract::class)->createBooking(new CreateBookingDTO(
            renterId: $renter->id,
            atelierId: $atelier->id,
            dressId: $dress->id,
            dressSizeId: null,
            startDate: now()->addDays(5),
            endDate: now()->addDays(6),
            deliveryAddress: '123 Main St',
            clientToken: 'fin-tb-'.uniqid(),
        ));

        // 1. Capture the rental (booking-capture journal).
        $session = app(PaymentContract::class)->initiateBookingPayment($booking->id, 'mock_card_success', 'http://x/cb', 'tb-init');
        app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'tb-capture');

        // 2. Settle the deposit (clean release).
        app(PaymentContract::class)->processDepositSettlement(
            $booking->id,
            Money::fromDecimal(400, 'EGP'),
            Money::fromDecimal(0, 'EGP'),
            Money::fromDecimal(400, 'EGP'),
            'tb-settle',
        );

        // 3. Execute a payout.
        $payout = app(SettlementContract::class)->createPayout($atelier->id, Money::fromDecimal(900, 'EGP'), 'tb-payout');
        $transaction = Transaction::query()->create([
            'booking_id' => null,
            'user_id' => $owner->id,
            'atelier_id' => $atelier->id,
            'type' => 'atelier_payout',
            'amount' => $payout->amount,
            'currency' => $payout->currency,
            'payment_method' => 'bank_transfer',
            'status' => 'captured',
            'idempotency_key' => 'tb-payout-tx',
        ]);
        app(SettlementContract::class)->processPayout($payout, $transaction);

        // The entire ledger must be balanced.
        $this->assertTrue(app(LedgerContract::class)->verifyLedgerBalance());
    }
}
