<?php

declare(strict_types=1);

namespace Tests\Feature\Payment;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Entities\PaymentWebhookEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookProcessingTest extends TestCase
{
    use RefreshDatabase;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(FinanceSeeder::class);

        $this->seed(FinanceSeeder::class);
        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
        $category = CategoryFactory::new()->create();
        $dress = DressFactory::new()->active()->create([
            'atelier_id' => $atelier->id,
            'category_id' => $category->id,
            'rental_price_per_day' => 500,
            'cleaning_fee' => 150,
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
            clientToken: 'webhook-'.uniqid(),
        ));
    }

    private function signedPayload(array $data): array
    {
        $body = json_encode($data, JSON_THROW_ON_ERROR);
        $signature = hash_hmac('sha256', $body, (string) config('app.key'));

        return [$body, $signature];
    }

    public function test_valid_webhook_signature_processes_and_confirms_booking(): void
    {
        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_3ds', 'http://x/cb', 'wh-init');

        $payload = [
            'event_id' => 'evt-'.uniqid(),
            'type' => 'payment.succeeded',
            'gateway_reference' => $session->gatewayReference,
        ];

        [$body, $signature] = $this->signedPayload($payload);

        $this->withHeader('X-Webhook-Signature', $signature)
            ->postJson('/api/payments/webhook', $payload)
            ->assertOk()
            ->assertJsonPath('status', 'received');

        $event = PaymentWebhookEvent::query()->first();
        $this->assertNotNull($event);
        $this->assertSame('processed', $event->status);

        $this->assertSame(BookingStatus::Confirmed, $this->booking->fresh()->status);
    }

    public function test_invalid_signature_returns_401(): void
    {
        $payload = ['event_id' => 'evt-bad', 'type' => 'payment.succeeded'];

        $this->withHeader('X-Webhook-Signature', 'invalid')
            ->postJson('/api/payments/webhook', $payload)
            ->assertStatus(401);

        $this->assertSame(0, PaymentWebhookEvent::query()->count());
        $this->assertSame(BookingStatus::PendingPayment, $this->booking->fresh()->status);
    }

    public function test_replayed_webhook_event_is_ignored(): void
    {
        $session = app(PaymentContract::class)->initiateBookingPayment($this->booking->id, 'mock_card_3ds', 'http://x/cb', 'wh-replay');

        $payload = [
            'event_id' => 'evt-replay',
            'type' => 'payment.succeeded',
            'gateway_reference' => $session->gatewayReference,
        ];

        [$body, $signature] = $this->signedPayload($payload);

        $this->withHeader('X-Webhook-Signature', $signature)->postJson('/api/payments/webhook', $payload)->assertOk();
        $this->withHeader('X-Webhook-Signature', $signature)->postJson('/api/payments/webhook', $payload)->assertOk()->assertJsonPath('status', 'ignored');

        $this->assertSame(1, PaymentWebhookEvent::query()->count());
    }
}
