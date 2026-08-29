<?php

declare(strict_types=1);

namespace App\Modules\Payment\Infrastructure\Jobs;

use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Entities\PaymentWebhookEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPaymentWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly int $webhookEventId) {}

    public function handle(PaymentContract $payments): void
    {
        $event = PaymentWebhookEvent::query()->find($this->webhookEventId);

        if ($event === null) {
            return;
        }

        $payload = $event->payload_json ?? [];

        if ($event->event_type === 'payment.succeeded') {
            $payments->handlePaymentSuccess(
                (string) ($payload['gateway_reference'] ?? ''),
                'webhook-'.$event->id,
                $payload,
            );
        } elseif ($event->event_type === 'payment.failed') {
            $payments->handlePaymentFailure(
                (string) ($payload['gateway_reference'] ?? ''),
                (string) ($payload['message'] ?? 'Payment failed.'),
            );
        }

        $event->update(['status' => 'processed', 'processed_at' => now()]);
    }
}
