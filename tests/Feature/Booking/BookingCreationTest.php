<?php

declare(strict_types=1);

namespace Tests\Feature\Booking;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Availability\Domain\Entities\DressAvailability;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingCreationTest extends TestCase
{
    use RefreshDatabase;

    private User $renter;

    private Atelier $atelier;

    private Dress $dress;

    protected function setUp(): void
    {
        parent::setUp();

        $owner = UserFactory::new()->atelierOwner()->create();
        $this->atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
        $category = CategoryFactory::new()->create();

        $this->dress = DressFactory::new()->active()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $category->id,
            'rental_price_per_day' => 500,
            'cleaning_fee' => 150,
            'security_deposit_amount' => 2000,
            'late_fee_per_day' => 200,
            'turnaround_buffer_days' => 2,
        ]);

        $this->renter = UserFactory::new()->renter()->create();
        KycVerification::query()->create([
            'user_id' => $this->renter->id,
            'status' => 'approved',
            'document_type' => 'national_id',
            'front_path' => 'users/'.$this->renter->id.'/national_id/front.jpg',
        ]);
    }

    private function payload(array $overrides = []): array
    {
        $start = now()->addDays(5)->toDateString();
        $end = now()->addDays(7)->toDateString();

        return array_merge([
            'dress_id' => $this->dress->id,
            'start_date' => $start,
            'end_date' => $end,
            'delivery_address' => '123 Main St, Riyadh',
            'client_token' => 'test-token-'.uniqid(),
        ], $overrides);
    }

    public function test_booking_creation_locks_dates_and_creates_buffer_holds(): void
    {
        $start = now()->addDays(5)->toDateString();
        $end = now()->addDays(7)->toDateString();

        $this->actingAs($this->renter)
            ->post("/checkout/{$this->dress->id}", $this->payload())
            ->assertRedirect();

        $booking = Booking::query()->latest('id')->first();
        $this->assertNotNull($booking);
        $this->assertSame('pending_payment', $booking->status->value);
        $this->assertMatchesRegularExpression('/^DRESS-\d{8}-[A-Z0-9]{4}$/', $booking->booking_reference);

        $this->assertDatabaseHas('dress_availabilities', [
            'dress_id' => $this->dress->id,
            'start_date' => $start,
            'end_date' => $end,
            'reason' => 'confirmed_booking',
            'reference_id' => $booking->id,
        ]);

        $bufferStart = now()->addDays(8)->toDateString();
        $this->assertDatabaseHas('dress_availabilities', [
            'dress_id' => $this->dress->id,
            'start_date' => $bufferStart,
            'reason' => 'cleaning',
            'reference_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('booking_items', ['booking_id' => $booking->id, 'dress_id' => $this->dress->id]);
    }

    public function test_server_recalculates_total_ignoring_client_prices(): void
    {
        $this->actingAs($this->renter)
            ->post("/checkout/{$this->dress->id}", $this->payload([
                'price' => 1,
                'grand_total' => 1,
                'security_deposit_amount' => 1,
            ]))
            ->assertRedirect();

        $booking = Booking::query()->latest('id')->first();

        // Server-side: 500 × 3 days = 1500; cleaning 150; tax 1500 × 0.14 = 210; deposit 2000 => 3860.00
        $this->assertSame('1500.00', $booking->rental_rate_total);
        $this->assertSame('2000.00', $booking->security_deposit_amount);
        $this->assertSame('3860.00', $booking->grand_total);
    }

    public function test_duplicate_submission_with_same_token_is_idempotent(): void
    {
        $payload = $this->payload(['client_token' => 'same-token']);

        $this->actingAs($this->renter)->post("/checkout/{$this->dress->id}", $payload)->assertRedirect();
        $this->actingAs($this->renter)->post("/checkout/{$this->dress->id}", $payload)->assertRedirect();

        $this->assertSame(1, Booking::query()->count());
    }

    public function test_overlapping_dates_are_rejected_and_rolled_back(): void
    {
        $this->actingAs($this->renter)->post("/checkout/{$this->dress->id}", $this->payload())->assertRedirect();

        // Overlapping second attempt: same dates.
        $this->actingAs($this->renter)
            ->post("/checkout/{$this->dress->id}", $this->payload(['client_token' => 'other-token']))
            ->assertRedirect()
            ->assertSessionHasErrors('booking');

        // Only one booking persisted; the failed attempt rolled back.
        $this->assertSame(1, Booking::query()->count());
        $this->assertSame(1, DressAvailability::query()->where('reason', 'confirmed_booking')->count());
    }

    public function test_unverified_renter_cannot_checkout(): void
    {
        $unverified = UserFactory::new()->renter()->create();

        $this->actingAs($unverified)
            ->post("/checkout/{$this->dress->id}", $this->payload())
            ->assertForbidden();

        $this->assertSame(0, Booking::query()->count());
    }
}
