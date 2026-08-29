<?php

declare(strict_types=1);

namespace Tests\Feature\Finance;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Finance\Application\DTOs\LedgerEntryDTO;
use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Finance\Domain\Entities\LedgerEntry;
use App\Modules\Finance\Domain\Exceptions\UnbalancedLedgerEntryException;
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DoubleEntryBalancingTest extends TestCase
{
    use RefreshDatabase;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(FinanceSeeder::class);

        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id, 'commission_rate' => 10.00]);
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
            clientToken: 'fin-bal-'.uniqid(),
        ));
    }

    private function captureRental(): Transaction
    {
        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'fin-init-'.uniqid());

        return app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'fin-capture-'.uniqid());
    }

    public function test_booking_capture_posts_strictly_balanced_journal(): void
    {
        $transaction = $this->captureRental();

        $this->assertTrue(app(LedgerContract::class)->verifyLedgerBalance($transaction->id));

        $debits = number_format((float) LedgerEntry::query()->where('transaction_id', $transaction->id)->sum('debit'), 2, '.', '');
        $credits = number_format((float) LedgerEntry::query()->where('transaction_id', $transaction->id)->sum('credit'), 2, '.', '');
        $this->assertSame($debits, $credits);

        // Escrow debit = 1500 + 150 + 2000 = 3650.
        $this->assertSame('3650.00', $this->accountTotal($transaction->id, '1010', 'debit'));
        $this->assertSame('2000.00', $this->accountTotal($transaction->id, '2010', 'credit'));
        $this->assertSame('1350.00', $this->accountTotal($transaction->id, '2020', 'credit'));
        $this->assertSame('150.00', $this->accountTotal($transaction->id, '2030', 'credit'));
        $this->assertSame('150.00', $this->accountTotal($transaction->id, '4010', 'credit'));
    }

    public function test_unbalanced_journal_throws_and_leaves_no_orphaned_rows(): void
    {
        $transaction = $this->captureRental();

        $this->expectException(UnbalancedLedgerEntryException::class);

        app(LedgerContract::class)->recordTransaction($transaction->id, [
            new LedgerEntryDTO('1010', Money::fromDecimal(100, 'EGP'), true, 'Forced imbalance'),
            new LedgerEntryDTO('2010', Money::fromDecimal(50, 'EGP'), false, 'Forced imbalance'),
        ]);

        $this->assertSame(0, LedgerEntry::query()->where('transaction_id', $transaction->id)->where('description', 'Forced imbalance')->count());
    }

    public function test_posting_is_idempotent_per_transaction(): void
    {
        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'fin-init-idem');
        app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'fin-cap-idem');
        $count = LedgerEntry::query()->where('transaction_id', $this->booking->transactions()->where('type', 'rental_payment')->first()->id)->count();

        // Replaying the same success callback does not duplicate the journal.
        app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'fin-cap-idem');

        $this->assertSame($count, LedgerEntry::query()->where('transaction_id', $this->booking->transactions()->where('type', 'rental_payment')->first()->id)->count());
    }

    private function accountTotal(int $transactionId, string $code, string $column): string
    {
        $sum = LedgerEntry::query()
            ->join('ledger_accounts', 'ledger_entries.account_id', '=', 'ledger_accounts.id')
            ->where('ledger_entries.transaction_id', $transactionId)
            ->where('ledger_accounts.code', $code)
            ->sum($column);

        return number_format((float) $sum, 2, '.', '');
    }
}
