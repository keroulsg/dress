<?php

declare(strict_types=1);

namespace App\Modules\Finance\Application\Services;

use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Finance\Domain\Contracts\SettlementContract;
use App\Modules\Finance\Domain\Entities\AtelierPayout;
use App\Modules\Finance\Domain\Exceptions\InsufficientPayoutBalanceException;
use App\Modules\Finance\Infrastructure\Repositories\LedgerRepository;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Atelier settlement: commission calculation, payout requests, and execution.
 */
class SettlementService implements SettlementContract
{
    public function __construct(
        private readonly LedgerRepository $ledger,
        private readonly LedgerContract $ledgerPosting,
    ) {}

    public function calculateAtelierPayable(Money $rentalSubtotal, float $commissionRate): array
    {
        $rate = max(0.0, min(1.0, $commissionRate));
        $commission = $rentalSubtotal->multiply((string) $rate);
        $payable = $rentalSubtotal->subtract($commission);

        return [
            'payable' => $payable,
            'commission' => $commission,
        ];
    }

    public function createPayout(int $atelierId, Money $amount, string $payoutKey): AtelierPayout
    {
        if ($this->ledger->findPayout($payoutKey) !== null) {
            return AtelierPayout::query()->where('payout_key', $payoutKey)->firstOrFail();
        }

        $available = $this->ledgerPosting->getAtelierAvailableBalance($atelierId);

        if ($amount->greaterThan($available)) {
            throw InsufficientPayoutBalanceException::forAtelier($atelierId, $available->__toString());
        }

        $payoutId = $this->ledger->storePayout([
            'atelier_id' => $atelierId,
            'amount' => $amount->amount(),
            'currency' => $amount->currency(),
            'payout_key' => $payoutKey,
            'status' => 'pending',
        ]);

        return AtelierPayout::query()->findOrFail($payoutId);
    }

    public function processPayout(AtelierPayout $payout, Transaction $transaction): void
    {
        $this->ledgerPosting->recordAtelierPayout($payout, $transaction);
        $this->ledger->markPayoutPaid($payout->id);
    }
}
