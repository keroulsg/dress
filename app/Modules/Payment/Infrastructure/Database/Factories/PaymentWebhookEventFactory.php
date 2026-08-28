<?php

declare(strict_types=1);

namespace App\Modules\Payment\Infrastructure\Database\Factories;

use App\Modules\Payment\Domain\Entities\PaymentWebhookEvent;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PaymentWebhookEvent>
 */
class PaymentWebhookEventFactory extends Factory
{
    protected $model = PaymentWebhookEvent::class;

    public function definition(): array
    {
        return [
            'gateway_event_id' => Str::uuid()->toString(),
            'gateway' => 'test',
            'event_type' => 'payment.captured',
            'payload_json' => ['type' => 'payment.captured'],
            'status' => 'received',
            'processed_at' => null,
        ];
    }

    public function processed(): static
    {
        return $this->state(fn (): array => [
            'status' => 'processed',
            'processed_at' => now(),
        ]);
    }
}
