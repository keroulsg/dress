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
use App\Modules\Inspection\Domain\Entities\InspectionDamageItem;
use App\Modules\Inspection\Domain\Enums\InspectionPhase;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostReturnInspectionTest extends TestCase
{
    use RefreshDatabase;

    private User $inspector;

    private Booking $booking;

    private int $deposit;

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
        $this->deposit = 2000;

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
            clientToken: 'insp-post-'.uniqid(),
        ));

        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_success', 'http://x/cb', 'insp-init-'.uniqid());
        app(PaymentContract::class)->handlePaymentSuccess((string) $session->gatewayReference, 'insp-cap-'.uniqid());

        $this->driveToReturned();
    }

    public function test_post_return_records_multiple_damage_items_with_photos(): void
    {
        app(InspectionContract::class)->createPostReturnReport(
            $this->booking->id,
            $this->inspector->id,
            new CreateInspectionDTO(
                phase: InspectionPhase::PostReturn->value,
                conditionSummary: 'stain_repairable',
                damageItems: [
                    new AddDamageItemDTO('hem', 'tear', 'moderate', 'Hem torn along the seam', 80, 100, UploadedFile::fake()->image('hem.jpg')),
                    new AddDamageItemDTO('bodice', 'stain', 'minor', 'Wine stain on bodice', 50, 60, UploadedFile::fake()->image('stain.jpg')),
                ],
            ),
        );

        $this->assertSame(2, InspectionDamageItem::query()->count());
        $this->assertDatabaseHas('inspection_damage_items', ['location' => 'hem', 'deduction_amount' => '100.00']);
        $this->assertDatabaseHas('inspection_damage_items', ['location' => 'bodice', 'deduction_amount' => '60.00']);

        $photos = InspectionDamageItem::query()->whereNotNull('photo_path')->pluck('photo_path')->all();
        $this->assertCount(2, $photos);
        $this->assertStringContainsString('inspections/', $photos[0]);
        Storage::disk('public')->assertExists($photos[0]);
    }

    public function test_total_recommended_deductions_equal_sum_of_items(): void
    {
        app(InspectionContract::class)->createPostReturnReport(
            $this->booking->id,
            $this->inspector->id,
            new CreateInspectionDTO(
                phase: InspectionPhase::PostReturn->value,
                conditionSummary: 'stain_repairable',
                damageItems: [
                    new AddDamageItemDTO('hem', 'tear', 'moderate', null, 0, 100),
                    new AddDamageItemDTO('zipper', 'broken_zipper', 'major', null, 0, 250),
                ],
            ),
        );

        $summary = app(InspectionContract::class)->getBookingInspectionSummary($this->booking->id);

        $this->assertSame('350.0000', $summary->totalDeductions->amount());
    }

    public function test_finalized_deduction_is_clamped_at_held_deposit(): void
    {
        $report = app(InspectionContract::class)->createPostReturnReport(
            $this->booking->id,
            $this->inspector->id,
            new CreateInspectionDTO(
                phase: InspectionPhase::PostReturn->value,
                conditionSummary: 'torn_repairable',
                damageItems: [
                    new AddDamageItemDTO('train', 'tear', 'critical', null, 0, 5000),
                ],
            ),
        );

        $finalized = app(InspectionContract::class)->finalizeInspection($report->id, $this->inspector->id);

        // Clamped at the held deposit (2000), never above.
        $this->assertSame('2000.00', $finalized->approved_deposit_deduction);
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
