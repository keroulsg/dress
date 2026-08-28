<?php

declare(strict_types=1);

namespace App\Modules\Payment\Infrastructure\Repositories;

interface PaymentRepository
{
    public function storeTransaction(array $attributes): int;

    public function findTransaction(int $transactionId): ?array;

    public function updateTransactionStatus(int $transactionId, string $status, ?string $gatewayReference = null): void;

    public function findIdempotencyRecord(string $key): ?array;

    public function storeIdempotencyKey(string $key, string $operation, int $transactionId): void;

    public function hasWebhookEvent(string $gatewayEventId): bool;

    public function storeWebhookEvent(array $attributes): void;

    /**
     * @return list<array<string, mixed>>
     */
    public function transactionsForBooking(int $bookingId): array;
}
