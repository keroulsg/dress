<?php

declare(strict_types=1);

namespace App\Modules\Finance\Application\Services;

use App\Modules\Finance\Application\DTOs\LedgerEntryDTO;
use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Finance\Domain\Entities\AtelierPayout;
use App\Modules\Finance\Domain\Exceptions\LedgerAccountNotFoundException;
use App\Modules\Finance\Domain\Exceptions\UnbalancedLedgerEntryException;
use App\Modules\Finance\Infrastructure\Repositories\LedgerRepository;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Double-entry ledger authority. Every journal is balanced before commit and
 * strictly append-only. Domain events drive standard postings.
 */
class DoubleEntryLedgerService implements LedgerContract
{
    private const SCALE = 4;

    public function __construct(private readonly LedgerRepository $ledger) {}

    public function recordBookingCapture(Transaction $transaction, Money $rentalSubtotal, Money $cleaningFee, Money $depositAmount, Money $commissionAmount): void
    {
        $rentalNet = $rentalSubtotal->subtract($commissionAmount);
        $escrowTotal = $rentalSubtotal->add($cleaningFee)->add($depositAmount);

        $this->post($transaction->id, 'Booking captured', [
            '1010' => $escrowTotal,
        ], [
            '2010' => $depositAmount,
            '2020' => $rentalNet,
            '2030' => $cleaningFee,
            '4010' => $commissionAmount,
        ]);
    }

    public function recordDepositSettlement(Transaction $transaction, Money $depositHeld, Money $deductionAmount, Money $refundAmount): void
    {
        $this->post($transaction->id, 'Deposit settlement', [
            '2010' => $depositHeld,
        ], [
            '1010' => $refundAmount,
            '2020' => $deductionAmount,
        ]);
    }

    public function recordCustomerRefund(Transaction $transaction, Money $refundAmount, Money $reversalCommission): void
    {
        $netRefund = $refundAmount->subtract($reversalCommission);

        $this->post($transaction->id, 'Customer refund', [
            '1010' => $refundAmount,
        ], [
            '2020' => $netRefund,
            '4010' => $reversalCommission,
        ]);
    }

    public function recordAtelierPayout(AtelierPayout $payout, Transaction $transaction): void
    {
        $this->post($transaction->id, 'Atelier payout '.$payout->payout_key, [
            '2020' => Money::fromDecimal($payout->amount, $payout->currency),
        ], [
            '1010' => Money::fromDecimal($payout->amount, $payout->currency),
        ]);
    }

    public function verifyLedgerBalance(?int $transactionId = null): bool
    {
        if ($transactionId !== null) {
            $debits = '0';
            $credits = '0';

            foreach ($this->ledger->getEntries($transactionId) as $entry) {
                $debits = bcadd($debits, (string) ($entry['debit'] ?? 0), self::SCALE);
                $credits = bcadd($credits, (string) ($entry['credit'] ?? 0), self::SCALE);
            }

            return bccomp($debits, $credits, self::SCALE) === 0;
        }

        $totals = $this->ledger->globalDebitCreditTotals();

        return bccomp($totals['debits'], $totals['credits'], self::SCALE) === 0;
    }

    public function getAtelierAvailableBalance(int $atelierId): Money
    {
        return Money::fromDecimal($this->ledger->atelierPayableBalance($atelierId), 'EGP');
    }

    public function recordTransaction(int $transactionId, array $ledgerEntries): void
    {
        $debits = '0';
        $credits = '0';

        foreach ($ledgerEntries as $entry) {
            $amount = $entry->amount->amount();

            if ($entry->isDebit) {
                $debits = bcadd($debits, $amount, self::SCALE);
            } else {
                $credits = bcadd($credits, $amount, self::SCALE);
            }
        }

        if (bccomp($debits, $credits, self::SCALE) !== 0) {
            throw UnbalancedLedgerEntryException::forTransaction($transactionId, $debits, $credits);
        }

        if ($this->ledger->getEntries($transactionId) !== []) {
            return;
        }

        $this->ledger->insertEntries($transactionId, array_map(function ($entry): array {
            $account = $this->ledger->findAccountByCode($entry->accountCode);

            if ($account === null) {
                throw LedgerAccountNotFoundException::forCode($entry->accountCode);
            }

            return [
                'account_id' => (int) $account['id'],
                'debit' => $entry->isDebit ? $entry->amount->amount() : '0',
                'credit' => $entry->isDebit ? '0' : $entry->amount->amount(),
                'description' => $entry->description,
            ];
        }, $ledgerEntries));
    }

    /**
     * @param  array<string, Money>  $debits
     * @param  array<string, Money>  $credits
     */
    private function post(int $transactionId, string $description, array $debits, array $credits): void
    {
        $entries = [];

        foreach ($debits as $code => $amount) {
            $entries[] = new LedgerEntryDTO((string) $code, $amount, true, $description);
        }

        foreach ($credits as $code => $amount) {
            $entries[] = new LedgerEntryDTO((string) $code, $amount, false, $description);
        }

        $this->recordTransaction($transactionId, $entries);
    }
}
