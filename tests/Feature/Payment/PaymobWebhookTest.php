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
use App\Modules\Payment\Infrastructure\Gateways\PaymobPaymentGateway;
use App\Modules\Pricing\Application\DTOs\PricingCalculationDTO;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymobWebhookTest extends TestCase
{
    use RefreshDatabase;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(FinanceSeeder::class);

        $owner = UserFactory::new()->atelierOwner()->create();
        $atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $owner->id]);
        $category = CategoryFactory::new()->create();
        $dress = DressFactory::new()->active()->create([
            'atelier_id' => $atelier->id,
            'category_id' => $category->id,
            'rental_price_per_day' => 1000,
            'cleaning_fee' => 200,
            'security_deposit_amount' => 3000,
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
            fittingDatetime: null,
            deliveryAddress: '123 Nile St, Zamalek, Cairo',
            clientToken: 'paymob-test-token-123',
        ));
    }

    public function test_ten_percent_reservation_fee_calculation(): void
    {
        $pricing = app(PricingContract::class);

        // 3 days @ 1000 EGP = 3000 EGP subtotal, Cleaning = 200 EGP, Deposit = 3000 EGP
        $dto = new PricingCalculationDTO(
            renterId: $this->booking->renter_id,
            atelierId: $this->booking->atelier_id,
            items: [['dress_id' => 1, 'daily_rate' => 1000]],
            startDate: now()->addDays(5),
            endDate: now()->addDays(7),
            rentalDays: 3,
            cleaningFee: 200,
            securityDeposit: 3000,
            currency: 'EGP',
        );

        $breakdown = $pricing->calculateBookingTotal($dto);
        $array = $breakdown->toArray();

        // totalBookingValue = 3000 + 200 = 3200 EGP
        // upfrontReservationFee = 10% of 3200 = 320 EGP
        // offlineSettlementBalance = 90% of 3200 + 3000 (deposit) = 2880 + 3000 = 5880 EGP
        $this->assertSame('3200', $array['total_booking_value']['amount']);
        $this->assertSame('320', $array['upfront_reservation_fee']['amount']);
        $this->assertSame('5880', $array['offline_settlement_balance']['amount']);
    }

    public function test_paymob_webhook_transitions_booking_to_confirmed(): void
    {
        config(['payment.paymob.hmac_secret' => 'test-hmac-secret-12345']);

        $gateway = app(PaymobPaymentGateway::class);

        $data = [
            'id' => 987654321,
            'amount_cents' => 32000, // 320.00 EGP (10% upfront fee)
            'currency' => 'EGP',
            'created_at' => '2026-09-17T20:00:00.000Z',
            'error_occured' => false,
            'has_parent_transaction' => false,
            'integration_id' => 12345,
            'is_3d_secure' => true,
            'is_auth' => false,
            'is_capture' => true,
            'is_refunded' => false,
            'is_standalone_payment' => true,
            'is_voided' => false,
            'order' => [
                'id' => 112233,
                'merchant_order_id' => (string) $this->booking->id,
            ],
            'owner' => 999,
            'pending' => false,
            'source_data' => [
                'pan' => '2345',
                'sub_type' => 'MasterCard',
                'type' => 'card',
            ],
            'success' => true,
        ];

        // Generate HMAC signature using Paymob's 20-field string concatenation
        $keys = [
            'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
            'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
            'is_standalone_payment', 'is_voided', 'order.id', 'owner', 'pending',
            'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
        ];

        $concatenated = '';
        foreach ($keys as $key) {
            $val = data_get($data, $key);
            if (is_bool($val)) {
                $concatenated .= $val ? 'true' : 'false';
            } elseif ($val !== null) {
                $concatenated .= (string) $val;
            }
        }

        $hmac = hash_hmac('sha512', $concatenated, 'test-hmac-secret-12345');

        $response = $this->postJson('/api/payments/paymob/webhook?hmac='.$hmac, [
            'type' => 'TRANSACTION',
            'obj' => $data,
        ]);

        $response->assertOk()
            ->assertJson([
                'status' => 'success',
                'booking_status' => 'confirmed',
            ]);

        $this->booking->refresh();
        $this->assertSame(BookingStatus::Confirmed, $this->booking->status);
    }

    public function test_paymob_webhook_rejects_invalid_hmac_signature(): void
    {
        config(['payment.paymob.hmac_secret' => 'test-hmac-secret-12345']);

        $data = [
            'id' => 999,
            'amount_cents' => 32000,
            'order' => [
                'merchant_order_id' => (string) $this->booking->id,
            ],
            'success' => true,
        ];

        $response = $this->postJson('/api/payments/paymob/webhook?hmac=forged-invalid-hmac', [
            'type' => 'TRANSACTION',
            'obj' => $data,
        ]);

        $response->assertStatus(400);

        $this->booking->refresh();
        $this->assertSame(BookingStatus::PendingPayment, $this->booking->status);
    }
}
