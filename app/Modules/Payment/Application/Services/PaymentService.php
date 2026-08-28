<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\Services;

use App\Modules\Payment\Application\DTOs\PaymentInitiationDTO;
use App\Modules\Payment\Application\DTOs\PaymentResultDTO;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use App\Modules\Payment\Domain\Contracts\PaymentGateway;
use App\Modules\Payment\Domain\Enums\TransactionStatus;
use App\Modules\Payment\Domain\Enums\TransactionType;
use App\Modules\Payment\Domain\Events\PaymentCaptured;
use App\Modules\Payment\Domain\Events\PaymentRefunded;
use App\Modules\Payment\Domain\Exceptions\IdempotencyConflictException;
use App\Modules\Payment\Domain\Exceptions\PaymentFailedException;
use App\Modules\Payment\Infrastructure\Repositories\PaymentRepository;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Support\Facades\Event;

class PaymentService implements PaymentContract
{
    public function __construct(
        private readonly PaymentRepository $payments,
        private readonly PaymentGateway $gateway,
    ) {}

    public function authorize(PaymentInitiationDTO $dto): PaymentResultDTO
    {
        $replay = $this->idempotencyResult($dto->idempotencyKey, 'authorize', $dto->amount);

        if ($replay !== null) {
            return $replay;
        }

        $gatewayResponse = $this->gateway->authorize($dto);

        $transactionId = $this->payments->storeTransaction([
            'booking_id' => $dto->bookingId,
            'user_id' => $dto->userId,
            'atelier_id' => $dto->atelierId,
            'type' => $dto->type,
            'payment_method' => $dto->paymentMethod,
            'status' => TransactionStatus::Authorized->value,
            'amount' => $dto->amount->toMinorUnits(),
            'currency' => $dto->amount->currency(),
            'gateway_reference' => $gatewayResponse['gateway_reference'] ?? null,
            'metadata' => $dto->metadata,
        ]);

        $this->payments->storeIdempotencyKey($dto->idempotencyKey, 'authorize', $transactionId);

        return new PaymentResultDTO(
            transactionId: $transactionId,
            status: TransactionStatus::Authorized->value,
            amount: $dto->amount,
            gatewayReference: $gatewayResponse['gateway_reference'] ?? null,
        );
    }

    public function capture(int $transactionId, string $idempotencyKey): PaymentResultDTO
    {
        $transaction = $this->requireTransaction($transactionId);
        $amount = $this->moneyFor($transaction);

        $replay = $this->idempotencyResult($idempotencyKey, 'capture', $amount);

        if ($replay !== null) {
            return $replay;
        }

        $gatewayResponse = $this->gateway->capture($transaction['gateway_reference'] ?? '', $amount);

        $this->payments->updateTransactionStatus($transactionId, TransactionStatus::Captured->value, $gatewayResponse['gateway_reference'] ?? null);
        $this->payments->storeIdempotencyKey($idempotencyKey, 'capture', $transactionId);

        Event::dispatch(new PaymentCaptured($transactionId, (int) $transaction['booking_id']));

        return new PaymentResultDTO(
            transactionId: $transactionId,
            status: TransactionStatus::Captured->value,
            amount: $amount,
            gatewayReference: $gatewayResponse['gateway_reference'] ?? null,
        );
    }

    public function void(int $transactionId, string $idempotencyKey): PaymentResultDTO
    {
        $transaction = $this->requireTransaction($transactionId);
        $amount = $this->moneyFor($transaction);

        $replay = $this->idempotencyResult($idempotencyKey, 'void', $amount);

        if ($replay !== null) {
            return $replay;
        }

        $gatewayResponse = $this->gateway->void($transaction['gateway_reference'] ?? '');

        $this->payments->updateTransactionStatus($transactionId, TransactionStatus::Voided->value, $gatewayResponse['gateway_reference'] ?? null);
        $this->payments->storeIdempotencyKey($idempotencyKey, 'void', $transactionId);

        return new PaymentResultDTO(
            transactionId: $transactionId,
            status: TransactionStatus::Voided->value,
            amount: $amount,
            gatewayReference: $gatewayResponse['gateway_reference'] ?? null,
        );
    }

    public function refund(int $transactionId, Money $amount, string $idempotencyKey): PaymentResultDTO
    {
        $transaction = $this->requireTransaction($transactionId);

        $replay = $this->idempotencyResult($idempotencyKey, 'refund', $amount);

        if ($replay !== null) {
            return $replay;
        }

        $gatewayResponse = $this->gateway->refund($transaction['gateway_reference'] ?? '', $amount);

        $this->payments->updateTransactionStatus($transactionId, TransactionStatus::Refunded->value, $gatewayResponse['gateway_reference'] ?? null);
        $this->payments->storeIdempotencyKey($idempotencyKey, 'refund', $transactionId);

        Event::dispatch(new PaymentRefunded($transactionId, (int) $transaction['booking_id']));

        return new PaymentResultDTO(
            transactionId: $transactionId,
            status: TransactionStatus::Refunded->value,
            amount: $amount,
            gatewayReference: $gatewayResponse['gateway_reference'] ?? null,
        );
    }

    public function holdDeposit(int $bookingId, Money $amount, string $idempotencyKey): PaymentResultDTO
    {
        $replay = $this->idempotencyResult($idempotencyKey, 'hold_deposit', $amount);

        if ($replay !== null) {
            return $replay;
        }

        $gatewayResponse = $this->gateway->authorize(new PaymentInitiationDTO(
            bookingId: $bookingId,
            userId: 0,
            atelierId: 0,
            amount: $amount,
            type: TransactionType::DepositAuthorization->value,
            paymentMethod: 'deposit',
            idempotencyKey: $idempotencyKey,
        ));

        $transactionId = $this->payments->storeTransaction([
            'booking_id' => $bookingId,
            'type' => TransactionType::DepositAuthorization->value,
            'payment_method' => 'deposit',
            'status' => TransactionStatus::Authorized->value,
            'amount' => $amount->toMinorUnits(),
            'currency' => $amount->currency(),
            'gateway_reference' => $gatewayResponse['gateway_reference'] ?? null,
        ]);

        $this->payments->storeIdempotencyKey($idempotencyKey, 'hold_deposit', $transactionId);

        return new PaymentResultDTO(
            transactionId: $transactionId,
            status: TransactionStatus::Authorized->value,
            amount: $amount,
            gatewayReference: $gatewayResponse['gateway_reference'] ?? null,
        );
    }

    public function releaseDeposit(int $transactionId, Money $amount, string $idempotencyKey): PaymentResultDTO
    {
        $transaction = $this->requireTransaction($transactionId);

        $replay = $this->idempotencyResult($idempotencyKey, 'release_deposit', $amount);

        if ($replay !== null) {
            return $replay;
        }

        $gatewayResponse = $this->gateway->void($transaction['gateway_reference'] ?? '');

        $this->payments->updateTransactionStatus($transactionId, TransactionStatus::Voided->value, $gatewayResponse['gateway_reference'] ?? null);
        $this->payments->storeIdempotencyKey($idempotencyKey, 'release_deposit', $transactionId);

        return new PaymentResultDTO(
            transactionId: $transactionId,
            status: TransactionStatus::Voided->value,
            amount: $amount,
            gatewayReference: $gatewayResponse['gateway_reference'] ?? null,
        );
    }

    public function processWebhook(array $payload, string $signature): bool
    {
        if (! $this->gateway->verifyWebhookSignature($payload, $signature)) {
            return false;
        }

        $eventId = (string) ($payload['event_id'] ?? '');

        if ($this->payments->hasWebhookEvent($eventId)) {
            return false;
        }

        $this->payments->storeWebhookEvent([
            'gateway_event_id' => $eventId,
            'type' => $payload['type'] ?? 'unknown',
            'payload' => $payload,
        ]);

        return true;
    }

    private function idempotencyResult(string $key, string $operation, Money $amount): ?PaymentResultDTO
    {
        $record = $this->payments->findIdempotencyRecord($key);

        if ($record === null) {
            return null;
        }

        if ($record['operation'] !== $operation) {
            throw IdempotencyConflictException::forKey($key, $operation);
        }

        $transaction = $this->payments->findTransaction((int) $record['transaction_id']);

        return new PaymentResultDTO(
            transactionId: (int) $record['transaction_id'],
            status: $transaction['status'] ?? TransactionStatus::Captured->value,
            amount: $transaction !== null ? $this->moneyFor($transaction) : $amount,
            gatewayReference: $transaction['gateway_reference'] ?? null,
            isReplay: true,
        );
    }

    private function requireTransaction(int $transactionId): array
    {
        $transaction = $this->payments->findTransaction($transactionId);

        if ($transaction === null) {
            throw PaymentFailedException::gatewayError(sprintf('Transaction #%d not found.', $transactionId));
        }

        return $transaction;
    }

    private function moneyFor(array $transaction): Money
    {
        $amount = isset($transaction['amount']) && is_numeric($transaction['amount'])
            ? $transaction['amount'] / 100
            : 0;

        return Money::fromDecimal((float) $amount, (string) ($transaction['currency'] ?? 'EGP'));
    }
}
