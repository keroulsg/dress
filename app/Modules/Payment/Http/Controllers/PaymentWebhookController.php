<?php

declare(strict_types=1);

namespace App\Modules\Payment\Http\Controllers;

use App\Modules\Payment\Domain\Contracts\PaymentGatewayContract;
use App\Modules\Payment\Infrastructure\Jobs\ProcessPaymentWebhook;
use App\Modules\Payment\Infrastructure\Repositories\PaymentRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PaymentWebhookController extends Controller
{
    public function __construct(
        private readonly PaymentGatewayContract $gateway,
        private readonly PaymentRepository $payments,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = (string) $request->header('X-Webhook-Signature');
        $data = $request->json()->all();

        if (! $this->gateway->verifyWebhookSignature($payload, $signature)) {
            return response()->json(['error' => 'Invalid signature.'], 401);
        }

        $eventId = (string) ($data['event_id'] ?? '');

        if ($eventId === '' || $this->payments->hasWebhookEvent($eventId)) {
            return response()->json(['status' => 'ignored']);
        }

        $event = $this->payments->storeWebhookEvent([
            'gateway_event_id' => $eventId,
            'gateway' => (string) config('payment.gateway', 'mock'),
            'event_type' => (string) ($data['type'] ?? 'unknown'),
            'payload_json' => $data,
            'status' => 'received',
        ]);

        ProcessPaymentWebhook::dispatch($event->id);

        return response()->json(['status' => 'received']);
    }
}
