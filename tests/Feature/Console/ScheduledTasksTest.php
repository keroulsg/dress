<?php

declare(strict_types=1);

namespace Tests\Feature\Console;

use App\Mail\BookingConfirmedMail;
use App\Mail\DepositRefundedMail;
use App\Mail\NewOrderAtelierNotificationMail;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Infrastructure\Database\Factories\BookingFactory;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduledTasksTest extends TestCase
{
    use RefreshDatabase;

    public function test_release_unpaid_holds_command_cancels_stale_pending_payment_bookings(): void
    {
        $renter = UserFactory::new()->renter()->create();
        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);

        // Stale booking created 40 minutes ago
        $staleBooking = BookingFactory::new()
            ->pendingPayment()
            ->create([
                'atelier_id' => $atelier->id,
                'renter_id' => $renter->id,
                'created_at' => now()->subMinutes(40),
                'updated_at' => now()->subMinutes(40),
            ]);

        // Fresh booking created 10 minutes ago
        $freshBooking = BookingFactory::new()
            ->pendingPayment()
            ->create([
                'atelier_id' => $atelier->id,
                'renter_id' => $renter->id,
                'created_at' => now()->subMinutes(10),
                'updated_at' => now()->subMinutes(10),
            ]);

        $this->artisan('bookings:release-unpaid-holds --minutes=30')
            ->expectsOutputToContain('Released 1 unpaid booking hold(s)')
            ->assertSuccessful();

        $staleBooking->refresh();
        $freshBooking->refresh();

        $this->assertSame(BookingStatus::Expired->value, $staleBooking->status->value);
        $this->assertSame(BookingStatus::PendingPayment->value, $freshBooking->status->value);
    }

    public function test_auto_resolve_returned_command_completes_idle_returned_bookings(): void
    {
        $renter = UserFactory::new()->renter()->create();
        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);

        $returnedBooking = BookingFactory::new()
            ->returnedPendingInspection()
            ->create([
                'atelier_id' => $atelier->id,
                'renter_id' => $renter->id,
                'returned_at' => now()->subHours(26),
                'actual_returned_at' => now()->subHours(26),
                'deposit_disputed' => false,
            ]);

        $this->artisan('bookings:auto-resolve-returned --hours=24')
            ->expectsOutputToContain('Auto-resolved 1 returned booking(s)')
            ->assertSuccessful();

        $returnedBooking->refresh();
        $this->assertSame(BookingStatus::Completed->value, $returnedBooking->status->value);
        $this->assertNotNull($returnedBooking->deposit_refunded_at);
    }

    public function test_transactional_luxury_mailables_render_successfully(): void
    {
        $renter = UserFactory::new()->renter()->create(['name' => 'سارة الأحمدي', 'email' => 'sara@example.com']);
        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create([
            'business_name' => 'أتيليه دي لامور',
            'owner_user_id' => $owner->id,
            'address' => 'شارع التسعين، التجمع الخامس',
            'whatsapp_number' => '+201012345678',
        ]);

        $booking = BookingFactory::new()
            ->confirmed()
            ->create([
                'atelier_id' => $atelier->id,
                'renter_id' => $renter->id,
                'order_type' => 'rent',
                'grand_total' => 2951,
            ]);

        // Attach relationship properties for testing
        $booking->setRelation('renter', $renter);
        $booking->setRelation('atelier', $atelier);

        // 1. BookingConfirmedMail
        $confirmedMail = new BookingConfirmedMail($booking);
        $confirmedHtml = $confirmedMail->render();
        $this->assertStringContainsString('Maison', $confirmedHtml);
        $this->assertStringContainsString('سارة الأحمدي', $confirmedHtml);
        $this->assertStringContainsString('العربون الإلكتروني المدفوع', $confirmedHtml);

        // 2. NewOrderAtelierNotificationMail
        $atelierMail = new NewOrderAtelierNotificationMail($booking);
        $atelierHtml = $atelierMail->render();
        $this->assertStringContainsString('أتيليه دي لامور', $atelierHtml);
        $this->assertStringContainsString('إشعار طلب مؤكد جديد', $atelierHtml);

        // 3. DepositRefundedMail
        $refundMail = new DepositRefundedMail($booking, 500.0);
        $refundHtml = $refundMail->render();
        $this->assertStringContainsString('تم تحرير واسترداد', $refundHtml);
        $this->assertStringContainsString('500.00', $refundHtml);
    }
}
