<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Entities\BookingItem;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\KYC\Domain\Enums\KycStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EndToEndLogicTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(FinanceSeeder::class);
    }

    public function test_renter_checkout_logic_10_percent_reservation_fee_and_whatsapp_reveal(): void
    {
        Storage::fake('kyc_private');

        // 1. Create Atelier Owner & Atelier
        $owner = User::factory()->create(['role' => 'atelier_owner']);
        $atelier = Atelier::factory()->create([
            'owner_user_id' => $owner->id,
            'business_name' => 'دار نور للأزياء',
            'phone' => '+201011112222',
            'whatsapp_number' => '+201099998888',
            'is_active' => true,
            'approved_at' => now(),
        ]);

        // 2. Create Dress
        $dress = Dress::factory()->create([
            'atelier_id' => $atelier->id,
            'title' => 'فستان سهرة كوتور مطرز',
            'rental_price_per_day' => '1000.00',
            'security_deposit_amount' => '300.00',
            'cleaning_fee' => '100.00',
            'status' => 'active',
        ]);

        // 3. Create Renter
        $renter = User::factory()->create(['role' => 'renter']);

        // 4. Create Pending Payment Booking (Total: 1000 rental + 100 cleaning + 300 deposit = 1400 total)
        $booking = Booking::factory()->create([
            'renter_id' => $renter->id,
            'atelier_id' => $atelier->id,
            'status' => BookingStatus::PendingPayment,
            'rental_rate_total' => '1000.00',
            'cleaning_fee_total' => '100.00',
            'security_deposit_amount' => '300.00',
            'grand_total' => '1400.00',
            'currency' => 'EGP',
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(8)->toDateString(),
        ]);

        BookingItem::factory()->create([
            'booking_id' => $booking->id,
            'dress_id' => $dress->id,
            'unit_rental_price' => '1000.00',
            'subtotal' => '1000.00',
            'quantity' => 1,
            'rental_days' => 3,
        ]);

        // 5. Check Renter Dashboard Overview displays pending booking
        $overviewResponse = $this->actingAs($renter)->get('/account/overview');
        $overviewResponse->assertStatus(200);

        // 6. Before 10% payment: WhatsApp & Address should be hidden
        $unpaidShowResponse = $this->actingAs($renter)->get("/account/bookings/{$booking->id}");
        $unpaidShowResponse->assertStatus(200);
        $unpaidData = $unpaidShowResponse->original->getData()['page']['props']['booking']['atelier'];
        $this->assertFalse($unpaidData['is_details_revealed']);
        $this->assertNull($unpaidData['whatsapp']);

        // 7. Simulate Payment of 10% Upfront Reservation Fee
        $payResponse = $this->actingAs($renter)->post("/checkout/{$booking->id}/pay", [
            'payment_method' => 'card',
            'idempotency_token' => 'idemp-token-12345',
        ]);
        $payResponse->assertRedirect(route('customer.bookings.show', $booking));

        // 8. Verify booking status transitioned to Confirmed
        $booking->refresh();
        $this->assertEquals(BookingStatus::Confirmed, $booking->status);

        // 9. After 10% payment: WhatsApp & Atelier details revealed!
        $paidShowResponse = $this->actingAs($renter)->get("/account/bookings/{$booking->id}");
        $paidShowResponse->assertStatus(200);
        $paidData = $paidShowResponse->original->getData()['page']['props']['booking']['atelier'];
        $this->assertTrue($paidData['is_details_revealed']);
        $this->assertEquals('+201099998888', $paidData['whatsapp']);
    }

    public function test_atelier_owner_settings_update_whatsapp_and_booking_kyc_download(): void
    {
        Storage::fake('kyc_private');

        $owner = User::factory()->create(['role' => 'atelier_owner']);
        $atelier = Atelier::factory()->create([
            'owner_user_id' => $owner->id,
            'whatsapp_number' => '+201012345678',
        ]);

        // 1. Atelier Owner updates WhatsApp number in settings
        $updateResponse = $this->actingAs($owner)->put("/atelier/{$atelier->id}/settings", [
            'business_name' => 'أتيليه رويال',
            'whatsapp_number' => '+201155443322',
            'phone' => '+201155443322',
            'city' => 'القاهرة',
            'address' => 'شارع الثورة، مصر الجديدة',
            'description' => 'أتيليه فساتين زفاف وسهرة راقية',
        ]);
        $updateResponse->assertRedirect();

        $atelier->refresh();
        $this->assertEquals('+201155443322', $atelier->whatsapp_number);

        // 2. Renter with KYC Verification
        $renter = User::factory()->create(['role' => 'renter']);
        $frontFile = UploadedFile::fake()->image('front_id.jpg');
        $frontPath = $frontFile->store('kyc/test', 'kyc_private');

        $kyc = KycVerification::create([
            'user_id' => $renter->id,
            'document_type' => 'national_id',
            'status' => KycStatus::Approved,
            'front_path' => $frontPath,
            'submitted_at' => now(),
        ]);

        $booking = Booking::factory()->create([
            'renter_id' => $renter->id,
            'atelier_id' => $atelier->id,
            'status' => BookingStatus::Confirmed,
        ]);

        // 3. Atelier Owner views booking #Type 3 KYC (Renter to Atelier Owner)
        $bookingShow = $this->actingAs($owner)->get("/atelier/{$atelier->id}/bookings/{$booking->id}");
        $bookingShow->assertStatus(200);

        // 4. Atelier Owner can download renter's ID file
        $downloadResponse = $this->actingAs($owner)->get("/kyc/documents/{$kyc->id}?side=front&download=1");
        $downloadResponse->assertStatus(200);
        $this->assertTrue($downloadResponse->headers->has('content-disposition'));
        $this->assertStringContainsString('attachment;', (string) $downloadResponse->headers->get('content-disposition'));

        // 5. Unrelated Atelier Owner CANNOT access this renter's KYC document (Strict isolation)
        $otherOwner = User::factory()->create(['role' => 'atelier_owner']);
        Atelier::factory()->create(['owner_user_id' => $otherOwner->id]);

        $unauthorizedResponse = $this->actingAs($otherOwner)->get("/kyc/documents/{$kyc->id}?side=front");
        $unauthorizedResponse->assertStatus(403);
    }

    public function test_admin_kyc_approval_workflows_type_1_and_type_2(): void
    {
        Storage::fake('kyc_private');

        $admin = User::factory()->create([
            'role' => 'superadmin',
            'email' => 'admin_test_e2e@dress.test',
        ]);

        // --- TYPE 1: Atelier Owner KYC to Platform Admin ---
        $owner = User::factory()->create(['role' => 'atelier_owner']);
        $atelier = Atelier::factory()->create([
            'owner_user_id' => $owner->id,
            'is_active' => false,
            'approved_at' => null,
        ]);

        $ownerKyc = KycVerification::create([
            'user_id' => $owner->id,
            'document_type' => 'national_id',
            'status' => KycStatus::Pending,
            'front_path' => 'kyc/owner_front.jpg',
            'submitted_at' => now(),
        ]);

        // Admin approves Type 1 KYC
        $reviewOwnerResponse = $this->actingAs($admin)->post("/admin/kyc/{$ownerKyc->id}/review", [
            'status' => 'approved',
        ]);
        $reviewOwnerResponse->assertRedirect();

        $ownerKyc->refresh();
        $atelier->refresh();
        $this->assertEquals(KycStatus::Approved, $ownerKyc->status);
        $this->assertTrue($atelier->isActive());
        $this->assertNotNull($atelier->approved_at);

        // --- TYPE 2: Renter KYC to Platform Admin ---
        $renter = User::factory()->create(['role' => 'renter']);
        $renterKyc = KycVerification::create([
            'user_id' => $renter->id,
            'document_type' => 'national_id',
            'status' => KycStatus::Pending,
            'front_path' => 'kyc/renter_front.jpg',
            'submitted_at' => now(),
        ]);

        // Admin approves Type 2 KYC
        $reviewRenterResponse = $this->actingAs($admin)->post("/admin/kyc/{$renterKyc->id}/review", [
            'status' => 'approved',
        ]);
        $reviewRenterResponse->assertRedirect();

        $renterKyc->refresh();
        $this->assertEquals(KycStatus::Approved, $renterKyc->status);

        // Verify Renter sees approved status in Account Overview
        $renterOverview = $this->actingAs($renter)->get('/account/overview');
        $renterOverview->assertStatus(200);
        $kycProp = $renterOverview->original->getData()['page']['props']['kyc'];
        $this->assertTrue($kycProp['is_verified']);
        $this->assertEquals('approved', $kycProp['status']);
    }

    public function test_atelier_overview_page_loads_without_errors(): void
    {
        $owner = User::factory()->create(['role' => 'atelier_owner']);
        $atelier = Atelier::factory()->create([
            'owner_user_id' => $owner->id,
            'business_name' => 'دار نور للأزياء',
        ]);

        $response = $this->actingAs($owner)->get("/atelier/{$atelier->id}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Atelier/Overview')
            ->has('atelier')
            ->has('kyc')
            ->has('stats')
        );
    }
}
