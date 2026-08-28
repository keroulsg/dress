<?php

declare(strict_types=1);

namespace Tests\Feature\Security;

use App\Modules\Administration\Domain\Entities\AuditLog;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Infrastructure\Database\Factories\BookingFactory;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_change_is_audited(): void
    {
        $user = UserFactory::new()->renter()->create();

        $user->update(['role' => 'atelier_owner']);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'identity.role_changed',
            'auditable_type' => $user->getMorphClass(),
            'auditable_id' => $user->id,
        ]);
    }

    public function test_atelier_approval_and_suspension_are_audited(): void
    {
        $atelier = AtelierFactory::new()->pending()->create();

        $atelier->update(['approved_at' => now(), 'approved_by' => 1]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'atelier.approved',
            'auditable_id' => $atelier->id,
        ]);

        $atelier->update(['is_active' => false]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'atelier.suspended',
            'auditable_id' => $atelier->id,
        ]);
    }

    public function test_kyc_status_change_is_audited(): void
    {
        $renter = UserFactory::new()->renter()->create();
        $kyc = KycVerification::query()->create([
            'user_id' => $renter->id,
            'status' => 'pending',
            'document_type' => 'national_id',
            'front_path' => 'users/'.$renter->id.'/national_id/front.jpg',
        ]);

        $kyc->update(['status' => 'approved', 'reviewed_by' => 1, 'reviewed_at' => now()]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'kyc.status_changed',
            'auditable_id' => $kyc->id,
        ]);

        $record = AuditLog::query()->where('action', 'kyc.status_changed')->first();
        $this->assertSame('pending', json_decode($record->old_values_json, true)['status']);
        $this->assertSame('approved', json_decode($record->new_values_json, true)['status']);
    }

    public function test_booking_cancellation_is_audited(): void
    {
        $renter = UserFactory::new()->renter()->create();
        $booking = BookingFactory::new()->create(['renter_id' => $renter->id]);

        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => 'Customer request',
            'cancelled_by' => $renter->id,
            'cancelled_at' => now(),
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'booking.cancelled',
            'auditable_id' => $booking->id,
        ]);

        $record = AuditLog::query()->where('action', 'booking.cancelled')->first();
        $this->assertSame(
            'Customer request',
            json_decode($record->new_values_json, true)['cancellation_reason'],
        );
    }

    public function test_audit_records_are_append_only(): void
    {
        $renter = UserFactory::new()->renter()->create();
        $booking = BookingFactory::new()->create(['renter_id' => $renter->id]);

        $booking->update(['status' => 'cancelled', 'cancellation_reason' => 'Test']);

        $first = AuditLog::query()->where('action', 'booking.cancelled')->first();

        $booking->update(['status' => 'confirmed']);

        $count = AuditLog::query()->where('action', 'booking.cancelled')->count();
        $this->assertSame(1, $count);
        $this->assertSame($first->id, AuditLog::query()->where('action', 'booking.cancelled')->first()->id);
    }
}
