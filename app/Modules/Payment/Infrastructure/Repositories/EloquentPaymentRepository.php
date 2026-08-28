<?php

declare(strict_types=1);

namespace App\Modules\Payment\Infrastructure\Repositories;

use App\Modules\Payment\Domain\Entities\PaymentIdempotencyKey;
use App\Modules\Payment\Domain\Entities\PaymentWebhookEvent;
use App\Modules\Payment\Domain\Entities\Transaction;

class EloquentPaymentRepository implements PaymentRepository
{
    public function __construct(
        private readonly Transaction $transaction,
        private readonly PaymentIdempotencyKey $idempotencyKey,
        private readonly PaymentWebhookEvent $webhookEvent,
    ) {}

    public function storeTransaction(array $attributes): int
    {
        return $this->transaction->create($attributes)->id;
    }

    public function findTransaction(int $transactionId): ?array
    {
        return $this->transaction->find($transactionId)?->toArray();
    }

    public function updateTransactionStatus(int $transactionId, string $status, ?string $gatewayReference = null): void
    {
        $this->transaction->whereKey($transactionId)->update(array_filter([
            'status' => $status,
            'gateway_reference' => $gatewayReference,
        ]));
    }

    public function findIdempotencyRecord(string $key): ?array
    {
        return $this->idempotencyKey
            ->where('idempotency_key', $key)
            ->first()
            ?->toArray();
    }

    public function storeIdempotencyKey(string $key, string $operation, int $transactionId): void
    {
        $this->idempotencyKey->create([
            'idempotency_key' => $key,
            'operation' => $operation,
            'transaction_id' => $transactionId,
        ]);
    }

    public function hasWebhookEvent(string $gatewayEventId): bool
    {
        return $this->webhookEvent->where('gateway_event_id', $gatewayEventId)->exists();
    }

    public function storeWebhookEvent(array $attributes): void
    {
        $this->webhookEvent->create($attributes);
    }

    public function transactionsForBooking(int $bookingId): array
    {
        return $this->transaction->where('booking_id', $bookingId)->get()->toArray();
    }
}
