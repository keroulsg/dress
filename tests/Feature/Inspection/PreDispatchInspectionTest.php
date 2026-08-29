<?php

declare(strict_types=1);

namespace Tests\Feature\Inspection;

use App\Modules\Atelier\Domain\Entities\AtelierStaff;
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
use App\Modules\Inspection\Application\DTOs\AddDamageItemDTO;
use App\Modules\Inspection\Application\DTOs\CreateInspectionDTO;
use App\Modules\Inspection\Domain\Contracts\InspectionContract;
use App\Modules\Inspection\Domain\Entities\InspectionReport;
use App\Modules\Inspection\Domain\Enums\InspectionPhase;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PreDispatchInspectionTest extends TestCase
{
    use RefreshDatabase;

    private User $inspector;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(FinanceSeeder::class);
        Storage::fake('public');

        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
        $category = CategoryFactory::new()->create();
        $dress = DressFactory::new()->active()->create([
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
            dressId: $dress->id,
            dressSizeId: null,
            startDate: now()->addDays(5),
            endDate: now()->addDays(7),
            deliveryAddress: '123 Main St',
            clientToken: 'insp-pre-'.uniqid(),
        ));

        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'insp-init-'.uniqid());
        app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'insp-cap-'.uniqid());
    }

    public function test_inspector_records_clean_baseline_and_booking_is_ready_for_dispatch(): void
    {
        $report = app(InspectionContract::class)->createPreDispatchReport(
            $this->booking->id,
            $this->inspector->id,
            new CreateInspectionDTO(
                phase: InspectionPhase::PreDispatch->value,
                conditionSummary: 'perfect',
                damageDescription: 'Baseline clean, no flaws.',
            ),
        );

        $this->assertInstanceOf(InspectionReport::class, $report);
        $this->assertSame(InspectionPhase::PreDispatch, $report->phase);
        $this->assertSame(BookingStatus::ReadyForDispatch, $this->booking->fresh()->status);
        $this->assertDatabaseHas('inspection_reports', [
            'id' => $report->id,
            'booking_id' => $this->booking->id,
            'phase' => InspectionPhase::PreDispatch->value,
            'condition_summary' => 'perfect',
        ]);
    }

    public function test_pre_dispatch_report_can_include_damage_items(): void
    {
        app(InspectionContract::class)->createPreDispatchReport(
            $this->booking->id,
            $this->inspector->id,
            new CreateInspectionDTO(
                phase: InspectionPhase::PreDispatch->value,
                conditionSummary: 'normal_wear',
                damageItems: [
                    new AddDamageItemDTO(
                        location: 'hem',
                        damageType: 'stain',
                        severity: 'minor',
                        deductionAmount: 0,
                    ),
                ],
            ),
        );

        $this->assertDatabaseHas('inspection_damage_items', [
            'location' => 'hem',
            'damage_type' => 'stain',
            'severity' => 'minor',
        ]);
    }
}
