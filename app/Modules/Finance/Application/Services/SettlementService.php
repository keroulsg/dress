<?php

declare(strict_types=1);

namespace App\Modules\Finance\Application\Services;

use App\Modules\Finance\Application\DTOs\LedgerEntryDTO;
use App\Modules\Finance\Domain\Contracts\SettlementContract;
use App\Modules\Finance\Infrastructure\Repositories\LedgerRepository;
use App\Modules\Pricing\Domain\ValueObjects\Money;

class SettlementService implements SettlementContract
{
    public function __construct(
        private readonly LedgerRepository $ledger,
    ) {}

    public function calculateSettlement(int $transactionId): array
    {
        $currency = $this->ledger->findTransactionCurrency($transactionId) ?? 'EGP';
        $amountMinor = $this->ledger->findTransactionAmountMinor($transactionId);
        $amount = $amountMinor === null ? Money::zero($currency) : Money::fromMinorUnits($amountMinor, $currency);

        $rate = $this->ledger->findAtelierCommissionRate($transactionId) ?? 0.0;

        $commission = $amount->multiply($rate);
        $payable = $amount->subtract($commission);

        return [
            'payable' => $payable,
            'commission' => $commission,
        ];
    }

    public function createPayout(int $atelierId, Money $amount, string $payoutKey): void
    {
        if ($this->ledger->findPayout($payoutKey) !== null) {
            return;
        }

        $this->ledger->storePayout([
            'atelier_id' => $atelierId,
            'amount' => $amount->toMinorUnits(),
            'currency' => $amount->currency(),
            'payout_key' => $payoutKey,
            'status' => 'pending',
        ]);
    }

    public function settlementLedgerEntries(int $transactionId): array
    {
        $settlement = $this->calculateSettlement($transactionId);

        return [
            new LedgerEntryDTO('1100', $settlement['payable']->add($settlement['commission']), true, 'Rental payment received'),
            new LedgerEntryDTO('2200', $settlement['payable'], false, 'Atelier payable'),
            new LedgerEntryDTO('3200', $settlement['commission'], false, 'Platform commission'),
        ];
    }
}
