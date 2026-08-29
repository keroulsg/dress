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
use App\Modules\Inspection\Application\DTOs\CreateInspectionDTO;
use App\Modules\Inspection\Domain\Contracts\InspectionContract;
use App\Modules\Inspection\Domain\Enums\InspectionPhase;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CustomerApprovalAndScopeTest extends TestCase
{
    use RefreshDatabase;

    private User $inspector;

    private User $renter;

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
            clientToken: 'insp-scope-'.uniqid(),
        ));

        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'insp-init-'.uniqid());
        app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'insp-cap-'.uniqid());
    }

    public function test_renter_can_approve_finalized_inspection(): void
    {
        $this->driveToReturned();

        $report = app(InspectionContract::class)->createPostReturnReport(
            $this->booking->id,
            $this->inspector->id,
            new CreateInspectionDTO(InspectionPhase::PostReturn->value, 'normal_wear'),
        );
        app(InspectionContract::class)->finalizeInspection($report->id, $this->inspector->id);

        app(InspectionContract::class)->customerApproveInspection($report->id, $this->renter->id);

        $this->assertDatabaseHas('inspection_reports', [
            'id' => $report->id,
            'customer_approved' => true,
        ]);
    }

    public function test_inspector_from_another_atelier_cannot_inspect(): void
    {
        $otherOwner = UserFactory::new()->atelierOwner()->create();
        $otherAtelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $otherOwner->id]);
        $otherInspector = UserFactory::new()->atelierStaff()->create();
        AtelierStaff::query()->create([
            'atelier_id' => $otherAtelier->id,
            'user_id' => $otherInspector->id,
            'role' => 'inspector',
            'is_active' => true,
        ]);

        $this->expectException(AuthorizationException::class);

        app(InspectionContract::class)->createPreDispatchReport(
            $this->booking->id,
            $otherInspector->id,
            new CreateInspectionDTO(InspectionPhase::PreDispatch->value, 'perfect'),
        );
    }

    private function driveToReturned(): void
    {
        $svc = app(BookingOrchestratorContract::class);
        $svc->transitionStatus($this->booking->id, BookingStatus::ReadyForDispatch, ['actor_id' => $this->inspector->id]);
        $svc->transitionStatus($this->booking->id, BookingStatus::Dispatched, ['actor_id' => $this->inspector->id]);
        $svc->transitionStatus($this->booking->id, BookingStatus::InCustomerPossession, ['actor_id' => $this->renter->id]);
        $svc->transitionStatus($this->booking->id, BookingStatus::ReturnedPendingInspection, ['actor_id' => $this->inspector->id]);
    }
}
