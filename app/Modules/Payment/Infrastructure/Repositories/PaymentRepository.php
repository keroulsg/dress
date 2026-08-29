<?php

declare(strict_types=1);

namespace App\Modules\Payment\Infrastructure\Repositories;

use App\Modules\Payment\Domain\Entities\PaymentWebhookEvent;
use App\Modules\Payment\Domain\Entities\Transaction;

interface PaymentRepository
{
    public function storeTransaction(array $attributes): int;

    public function findTransaction(int $transactionId): ?array;

    public function findEntity(int $transactionId): ?Transaction;

    public function findByGatewayReference(string $gatewayReference): ?array;

    /**
     * @return array<string, mixed>|null
     */
    public function findCapturedRentalForBooking(int $bookingId): ?array;

    /**
     * @return array<string, mixed>|null
     */
    public function findLatestDepositAuthorization(int $bookingId): ?array;

    public function updateTransactionStatus(int $transactionId, string $status, ?string $gatewayReference = null): void;

    public function findIdempotencyRecord(string $key): ?array;

    public function storeIdempotencyKey(string $key, string $operation, int $transactionId): void;

    public function hasWebhookEvent(string $gatewayEventId): bool;

    public function storeWebhookEvent(array $attributes): PaymentWebhookEvent;

    public function markWebhookProcessed(string $gatewayEventId): void;

    /**
     * @return list<array<string, mixed>>
     */
    public function transactionsForBooking(int $bookingId): array;
}
