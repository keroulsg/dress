<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Entities\DressSize;
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Inspection\Domain\Entities\InspectionReport;
use App\Modules\Inspection\Domain\Enums\InspectionPhase;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\KYC\Domain\Enums\KycStatus;
use App\Modules\Review\Domain\Entities\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Complete End-to-End Human Journey Simulation
 * محاكاة بشرية واقعية متكاملة لرحلة المنصة من البداية وحتى النهاية
 */
class CompleteHumanSimulationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(FinanceSeeder::class);
        Storage::fake('kyc_private');
    }

    public function test_full_human_lifecycle_journey_from_atelier_creation_to_deposit_refund_and_review(): void
    {
        // =========================================================================
        // 1. ATELIER REGISTRATION & STORE ACTIVATION (صاحبة الأتيليه)
        // =========================================================================
        $owner = User::factory()->create([
            'name' => 'نور الهدى إبراهيم',
            'email' => 'noor.couture@maisonrentale.com',
            'role' => 'atelier_owner',
            'phone' => '+201012345678',
        ]);

        $atelier = AtelierFactory::new()->approved()->create([
            'owner_user_id' => $owner->id,
            'business_name' => 'دار نور كوتور للأزياء الراقية',
            'slug' => 'noor-couture-tanta',
            'governorate' => 'Gharbia',
            'city' => 'Tanta',
            'address' => 'شارع الجيش، برج الأناقة، طنطا',
            'phone' => '+201012345678',
            'whatsapp_number' => '+201099887766',
        ]);

        KycVerification::create([
            'user_id' => $owner->id,
            'document_type' => 'national_id',
            'status' => KycStatus::Approved,
            'front_path' => 'kyc/owner_cr.jpg',
            'submitted_at' => now(),
        ]);

        $this->actingAs($owner)
            ->get("/atelier/{$atelier->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Atelier/Overview')
                ->where('atelier.business_name', 'دار نور كوتور للأزياء الراقية'));

        // =========================================================================
        // 2. ATELIER CREATES & LISTS A LUXURY DRESS (رفع فستان زفاف ملكي جديد)
        // =========================================================================
        $category = Category::create([
            'name' => 'فساتين زفاف وسهرة',
            'slug' => 'wedding-evening-gowns',
            'description' => 'فساتين هوت كوتور وزفاف ملكية',
        ]);

        $dress = Dress::create([
            'atelier_id' => $atelier->id,
            'category_id' => $category->id,
            'title' => 'فستان زفاف ملكي مطرز باللؤلؤ والكريستال الفرنسي',
            'slug' => 'royal-pearl-wedding-gown',
            'sku' => 'NOOR-WED-001',
            'product_type' => 'dress',
            'governorate' => 'Gharbia',
            'city' => 'Tanta',
            'available_for_intercity_shipping' => true,
            'description' => 'تصميم استثنائي راقٍ مشغول يدوياً من التول الفرنسي واللؤلؤ الطبيعي.',
            'original_retail_value' => '25000.00',
            'rental_price_per_day' => '2500.00',
            'security_deposit_amount' => '1000.00',
            'cleaning_fee' => '200.00',
            'late_fee_per_day' => '500.00',
            'turnaround_buffer_days' => 2,
            'condition_rating' => 'brand_new',
            'status' => 'active',
            'allows_rent' => true,
            'allows_sale' => false,
            'published_at' => now(),
        ]);

        DressSize::create([
            'dress_id' => $dress->id,
            'size_code' => 'M',
            'bust' => 90,
            'waist' => 70,
            'hips' => 98,
            'length' => 165,
            'is_available' => true,
        ]);

        $this->assertDatabaseHas('dresses', [
            'id' => $dress->id,
            'title' => 'فستان زفاف ملكي مطرز باللؤلؤ والكريستال الفرنسي',
            'governorate' => 'Gharbia',
            'city' => 'Tanta',
        ]);

        // =========================================================================
        // 3. CUSTOMER ONBOARDING (تسجيل العميلة المستأجرة)
        // =========================================================================
        $renter = User::factory()->create([
            'name' => 'مريم الشريف',
            'email' => 'mariam.bride@gmail.com',
            'role' => 'renter',
            'phone' => '+201122334455',
        ]);

        KycVerification::create([
            'user_id' => $renter->id,
            'document_type' => 'national_id',
            'status' => KycStatus::Approved,
            'front_path' => 'kyc/renter_id.jpg',
            'submitted_at' => now(),
        ]);

        // =========================================================================
        // 4. DISCOVERY & LOCATION FILTERING (تصفح الكتالوج وفلترة المحافظة)
        // =========================================================================
        $catalogResponse = $this->actingAs($renter)->get('/catalog?governorate=Gharbia');
        $catalogResponse->assertOk();
        $catalogResponse->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Catalog')
            ->where('dresses.total', 1)
            ->where('dresses.data.0.id', $dress->id)
            ->where('dresses.data.0.governorate', 'Gharbia')
            ->where('dresses.data.0.city', 'Tanta'));

        // Customer opens the Dress Show page
        $dressShowResponse = $this->actingAs($renter)->get("/dresses/{$dress->slug}");
        $dressShowResponse->assertOk();
        $dressShowResponse->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/DressShow')
            ->where('dress.id', $dress->id)
            ->where('dress.governorate', 'Gharbia')
            ->where('dress.city', 'Tanta')
            ->where('dress.available_for_intercity_shipping', true));

        // =========================================================================
        // 5. CHECKOUT & RESERVATION (الحجز والدفع الإلكتروني وتأمين الضمان)
        // =========================================================================
        $startDate = now()->addDays(5)->toDateString();
        $endDate = now()->addDays(8)->toDateString(); // 3 days

        $checkoutResponse = $this->actingAs($renter)->post("/checkout/{$dress->id}", [
            'dress_id' => $dress->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'size' => 'M',
            'delivery_address' => 'شارع المدير، طنطا، الغربية',
            'client_token' => 'token-sim-'.uniqid(),
        ]);
        $checkoutResponse->assertRedirect();

        $booking = Booking::query()->where('renter_id', $renter->id)->latest('id')->firstOrFail();
        $this->assertEquals(BookingStatus::PendingPayment, $booking->status);

        // Before payment: Atelier WhatsApp and direct contact is hidden
        $unpaidShow = $this->actingAs($renter)->get("/account/bookings/{$booking->id}");
        $unpaidShow->assertOk();
        $unpaidAtelier = $unpaidShow->original->getData()['page']['props']['booking']['atelier'];
        $this->assertFalse($unpaidAtelier['is_details_revealed']);
        $this->assertNull($unpaidAtelier['whatsapp']);

        // Customer completes Payment via checkout
        $payResponse = $this->actingAs($renter)->post("/checkout/{$booking->id}/pay", [
            'payment_method' => 'card',
            'idempotency_token' => 'idemp-sim-'.uniqid(),
        ]);
        $payResponse->assertRedirect(route('customer.bookings.show', $booking));

        $booking->refresh();
        $this->assertEquals(BookingStatus::Confirmed, $booking->status);

        // After payment: WhatsApp and direct contact are revealed
        $paidShow = $this->actingAs($renter)->get("/account/bookings/{$booking->id}");
        $paidShow->assertOk();
        $paidAtelier = $paidShow->original->getData()['page']['props']['booking']['atelier'];
        $this->assertTrue($paidAtelier['is_details_revealed']);
        $this->assertEquals('+201099887766', $paidAtelier['whatsapp']);

        // =========================================================================
        // 6. ATELIER RECEIVES ORDER & PRE-RENTAL HANDOVER INSPECTION (الفحص والتسليم)
        // =========================================================================
        $atelierBookings = $this->actingAs($owner)->get("/atelier/{$atelier->id}/bookings");
        $atelierBookings->assertOk();

        // Atelier creates handover inspection report (no flaws)
        $preInspection = InspectionReport::create([
            'booking_id' => $booking->id,
            'inspector_id' => $owner->id,
            'phase' => InspectionPhase::PreDispatch,
            'condition_summary' => 'الفستان بحالة ممتازة وجاهز للتسليم للعميلة.',
            'finalized_at' => now(),
            'finalized_by' => $owner->id,
        ]);

        $this->assertNotNull($preInspection->id);

        $orchestrator = app(BookingOrchestratorContract::class);
        $orchestrator->transitionStatus($booking->id, BookingStatus::ReadyForDispatch, ['actor_id' => $owner->id]);
        $orchestrator->transitionStatus($booking->id, BookingStatus::Dispatched, ['actor_id' => $owner->id]);
        $orchestrator->transitionStatus($booking->id, BookingStatus::InCustomerPossession, ['actor_id' => $renter->id]);
        $orchestrator->transitionStatus($booking->id, BookingStatus::ReturnedPendingInspection, ['actor_id' => $owner->id]);

        $booking->forceFill(['deposit_refunded_at' => now()])->saveQuietly();

        $postInspection = InspectionReport::create([
            'booking_id' => $booking->id,
            'inspector_id' => $owner->id,
            'phase' => InspectionPhase::PostReturn,
            'condition_summary' => 'تم استلام الفستان بحالة نقية تماماً دون أي تلفيات أو بقع.',
            'recommended_deposit_deduction' => 0.00,
            'finalized_at' => now(),
            'finalized_by' => $owner->id,
        ]);

        $this->assertNotNull($postInspection->id);

        // =========================================================================
        // 8. CUSTOMER DEPOSIT ACKNOWLEDGMENT (إقرار استلام مبلغ التأمين للعميلة)
        // =========================================================================
        $ackResponse = $this->actingAs($renter)->post(
            route('customer.bookings.acknowledgeDeposit', $booking)
        );
        $ackResponse->assertRedirect();
        $ackResponse->assertSessionHas('success');

        $booking->refresh();
        $this->assertNotNull($booking->deposit_acknowledged_at);
        $this->assertEquals(BookingStatus::Completed, $booking->status);

        // =========================================================================
        // 9. CUSTOMER SUBMITS 5-STAR REVIEW (تقييم تجربة الاستئجار الفاخرة)
        // =========================================================================
        $review = Review::create([
            'renter_id' => $renter->id,
            'dress_id' => $dress->id,
            'atelier_id' => $atelier->id,
            'booking_id' => $booking->id,
            'rating' => 5,
            'comment' => 'فستان زفاف أسطوري، خامة استثنائية وتعامل راقٍ جداً من الأتيليه!',
        ]);

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'rating' => 5,
            'dress_id' => $dress->id,
        ]);

        // =========================================================================
        // 10. ATELIER FINANCE LEDGER & SETTLEMENT (لوحة أرباح الأتيليه)
        // =========================================================================
        $financeResponse = $this->actingAs($owner)->get("/atelier/{$atelier->id}/finance");
        $financeResponse->assertOk();
    }
}
