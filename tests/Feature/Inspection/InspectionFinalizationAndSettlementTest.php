<?php

declare(strict_types=1);

namespace Tests\Feature\Inspection;

use App\Modules\Atelier\Domain\Entities\AtelierStaff;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\Inspection\Application\DTOs\AddDamageItemDTO;
use App\Modules\Inspection\Application\DTOs\CreateInspectionDTO;
use App\Modules\Inspection\Domain\Contracts\InspectionContract;
use App\Modules\Inspection\Domain\Enums\InspectionPhase;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InspectionFinalizationAndSettlementTest extends TestCase
{
    use RefreshDatabase;

    private User $inspector;

    private Booking $booking;

    private Dress $dress;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(FinanceSeeder::class);
        Storage::fake('public');

        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
        $category = CategoryFactory::new()->create();
        $this->dress = DressFactory::new()->active()->create([
            'atelier_id' => $atelier->id,
            'category_id' => $category->id,
            'security_deposit_amount' => 2000,
        ]);

        $this->inspector = UserFactory::new()->atelierStaff()->create();
        AtelierStaff::query()->create([
            'atelier_id' => $atelier->id,
            'user_id' => $this->inspector->id,
            'role' => 'inspector',
            'is_active' => true,
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
            dressId: $this->dress->id,
            dressSizeId: null,
            startDate: now()->addDays(5),
            endDate: now()->addDays(7),
            deliveryAddress: '123 Main St',
            clientToken: 'insp-fin-'.uniqid(),
        ));

        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'insp-init-'.uniqid());
        app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'insp-cap-'.uniqid());

        $this->driveToReturned();
    }

    public function test_clean_finalize_releases_full_deposit_and_completes_booking(): void
    {
        $report = app(InspectionContract::class)->createPostReturnReport(
            $this->booking->id,
            $this->inspector->id,
            new CreateInspectionDTO(InspectionPhase::PostReturn->value, 'perfect'),
        );

        app(InspectionContract::class)->finalizeInspection($report->id, $this->inspector->id);

        $this->assertSame(BookingStatus::Completed, $this->booking->fresh()->status);

        $release = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'deposit_release')->first();
        $this->assertNotNull($release);
        $this->assertSame('2000.00', $release->amount);

        // The deposit settlement journal is balanced.
        $depositTx = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'deposit_authorization')->first();
        $this->assertTrue(app(LedgerContract::class)->verifyLedgerBalance($depositTx->id));

        // Garment routed to cleaning.
        $this->assertSame('cleaning', $this->dress->fresh()->status);
    }

    public function test_damaged_finalize_captures_penalty_refunds_remainder_and_sends_to_maintenance(): void
    {
        $report = app(InspectionContract::class)->createPostReturnReport(
            $this->booking->id,
            $this->inspector->id,
            new CreateInspectionDTO(
                phase: InspectionPhase::PostReturn->value,
                conditionSummary: 'stain_repairable',
                damageItems: [
                    new AddDamageItemDTO('hem', 'tear', 'moderate', 'Hem torn', 0, 150),
                ],
            ),
        );

        app(InspectionContract::class)->finalizeInspection($report->id, $this->inspector->id);

        $this->assertSame(BookingStatus::Completed, $this->booking->fresh()->status);
        $this->assertSame('maintenance', $this->dress->fresh()->status);

        $this->assertDatabaseHas('transactions', ['booking_id' => $this->booking->id, 'type' => 'deposit_penalty', 'amount' => '150.00']);
        $this->assertDatabaseHas('transactions', ['booking_id' => $this->booking->id, 'type' => 'deposit_release', 'amount' => '1850.00']);

        $depositTx = Transaction::query()->where('booking_id', $this->booking->id)->where('type', 'deposit_authorization')->first();
        $this->assertTrue(app(LedgerContract::class)->verifyLedgerBalance($depositTx->id));
        $this->assertTrue(app(LedgerContract::class)->verifyLedgerBalance());
    }

    public function test_override_deduction_is_used_when_provided(): void
    {
        $report = app(InspectionContract::class)->createPostReturnReport(
            $this->booking->id,
            $this->inspector->id,
            new CreateInspectionDTO(
                phase: InspectionPhase::PostReturn->value,
                conditionSummary: 'stain_repairable',
                damageItems: [
                    new AddDamageItemDTO('zipper', 'broken_zipper', 'major', null, 0, 300),
                ],
            ),
        );

        $finalized = app(InspectionContract::class)->finalizeInspection($report->id, $this->inspector->id, Money::fromDecimal(200, 'EGP'));

        $this->assertSame('200.00', $finalized->approved_deposit_deduction);
        $this->assertDatabaseHas('transactions', ['booking_id' => $this->booking->id, 'type' => 'deposit_penalty', 'amount' => '200.00']);
    }

    private function driveToReturned(): void
    {
        $svc = app(BookingOrchestratorContract::class);
        $svc->transitionStatus($this->booking->id, BookingStatus::ReadyForDispatch, ['actor_id' => $this->inspector->id]);
        $svc->transitionStatus($this->booking->id, BookingStatus::Dispatched, ['actor_id' => $this->inspector->id]);
        $svc->transitionStatus($this->booking->id, BookingStatus::InCustomerPossession, ['actor_id' => $this->booking->renter_id]);
        $svc->transitionStatus($this->booking->id, BookingStatus::ReturnedPendingInspection, ['actor_id' => $this->inspector->id]);
    }
}
