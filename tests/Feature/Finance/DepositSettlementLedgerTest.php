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
use App\Modules\Finance\Domain\Entities\LedgerEntry;
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepositSettlementLedgerTest extends TestCase
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
            clientToken: 'fin-dep-'.uniqid(),
        ));
    }

    public function test_clean_deposit_release_posts_balanced_ledger(): void
    {
        app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'dep-init');

        app(PaymentContract::class)->processDepositSettlement(
            $this->booking->id,
            Money::fromDecimal(2000, 'EGP'),
            Money::fromDecimal(0, 'EGP'),
            Money::fromDecimal(2000, 'EGP'),
            'dep-settle-clean',
        );

        $depositTx = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'deposit_authorization')->first();

        $this->assertTrue(app(LedgerContract::class)->verifyLedgerBalance($depositTx->id));

        $debits = number_format((float) LedgerEntry::query()->where('transaction_id', $depositTx->id)->sum('debit'), 2, '.', '');
        $credits = number_format((float) LedgerEntry::query()->where('transaction_id', $depositTx->id)->sum('credit'), 2, '.', '');
        $this->assertSame($debits, $credits);
        $this->assertSame('2000.00', $debits);
    }

    public function test_damage_deduction_shifts_liability_to_atelier_and_balances_escrow(): void
    {
        app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'dep-init-dmg');

        app(PaymentContract::class)->processDepositSettlement(
            $this->booking->id,
            Money::fromDecimal(2000, 'EGP'),
            Money::fromDecimal(150, 'EGP'),
            Money::fromDecimal(1850, 'EGP'),
            'dep-settle-dmg',
        );

        $depositTx = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'deposit_authorization')->first();

        $this->assertTrue(app(LedgerContract::class)->verifyLedgerBalance($depositTx->id));
        $this->assertSame('2000.00', $this->accountTotal($depositTx->id, '2010', 'debit'));
        $this->assertSame('1850.00', $this->accountTotal($depositTx->id, '1010', 'credit'));
        $this->assertSame('150.00', $this->accountTotal($depositTx->id, '2020', 'credit'));
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
