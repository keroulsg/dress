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
        return $this->transaction->newQuery()->create($attributes)->id;
    }

    public function findTransaction(int $transactionId): ?array
    {
        return $this->transaction->newQuery()->find($transactionId)?->toArray();
    }

    public function findEntity(int $transactionId): ?Transaction
    {
        return $this->transaction->newQuery()->find($transactionId);
    }

    public function findByGatewayReference(string $gatewayReference): ?array
    {
        return $this->transaction->newQuery()
            ->where('gateway_reference', $gatewayReference)
            ->orderByDesc('id')
            ->first()
            ?->toArray();
    }

    public function findCapturedRentalForBooking(int $bookingId): ?array
    {
        return $this->transaction->newQuery()
            ->where('booking_id', $bookingId)
            ->where('type', 'rental_payment')
            ->whereIn('status', ['captured', 'partially_refunded'])
            ->orderByDesc('id')
            ->first()
            ?->toArray();
    }

    public function findLatestDepositAuthorization(int $bookingId): ?array
    {
        return $this->transaction->newQuery()
            ->where('booking_id', $bookingId)
            ->where('type', 'deposit_authorization')
            ->orderByDesc('id')
            ->first()
            ?->toArray();
    }

    public function updateTransactionStatus(int $transactionId, string $status, ?string $gatewayReference = null): void
    {
        $this->transaction->newQuery()->whereKey($transactionId)->update(array_filter([
            'status' => $status,
            'gateway_reference' => $gatewayReference,
            'processed_at' => $status === 'captured' || $status === 'failed' || $status === 'refunded' || $status === 'voided' ? now() : null,
        ]));
    }

    public function findIdempotencyRecord(string $key): ?array
    {
        return $this->idempotencyKey->newQuery()
            ->where('idempotency_key', $key)
            ->first()
            ?->toArray();
    }

    public function storeIdempotencyKey(string $key, string $operation, int $transactionId): void
    {
        $this->idempotencyKey->newQuery()->firstOrCreate(
            ['idempotency_key' => $key],
            ['operation' => $operation, 'transaction_id' => $transactionId],
        );
    }

    public function hasWebhookEvent(string $gatewayEventId): bool
    {
        return $this->webhookEvent->newQuery()
            ->where('gateway_event_id', $gatewayEventId)
            ->exists();
    }

    public function storeWebhookEvent(array $attributes): PaymentWebhookEvent
    {
        return $this->webhookEvent->newQuery()->create($attributes);
    }

    public function markWebhookProcessed(string $gatewayEventId): void
    {
        $this->webhookEvent->newQuery()
            ->where('gateway_event_id', $gatewayEventId)
            ->update(['status' => 'processed', 'processed_at' => now()]);
    }

    public function transactionsForBooking(int $bookingId): array
    {
        return $this->transaction->newQuery()
            ->where('booking_id', $bookingId)
            ->orderByDesc('id')
            ->get()
            ->toArray();
    }
}
