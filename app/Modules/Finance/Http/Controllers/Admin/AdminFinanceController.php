<?php

declare(strict_types=1);

namespace App\Modules\Finance\Http\Controllers\Admin;

use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Finance\Domain\Contracts\SettlementContract;
use App\Modules\Finance\Domain\Entities\AtelierPayout;
use App\Modules\Finance\Domain\Entities\LedgerAccount;
use App\Modules\Finance\Domain\Entities\LedgerEntry;
use App\Modules\Payment\Domain\Entities\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AdminFinanceController extends Controller
{
    public function __construct(
        private readonly LedgerContract $ledger,
        private readonly SettlementContract $settlements,
    ) {}

    public function index(): Response
    {
        $accounts = LedgerAccount::query()->orderBy('code')->get()->map(fn ($account): array => [
            'code' => $account->code,
            'name' => $account->name,
            'type' => $account->type,
        ])->values()->all();

        $entries = LedgerEntry::query()
            ->with(['transaction', 'account'])
            ->latest('id')
            ->limit(100)
            ->get()
            ->map(fn (LedgerEntry $entry): array => [
                'transaction_id' => $entry->transaction_id,
                'account_code' => $entry->account?->code,
                'account_name' => $entry->account?->name,
                'debit' => $entry->debit,
                'credit' => $entry->credit,
                'description' => $entry->description,
                'created_at' => $entry->created_at?->toDateTimeString(),
            ])
            ->values()
            ->all();

        $pendingPayouts = AtelierPayout::query()
            ->where('status', 'pending')
            ->with('atelier:id,business_name')
            ->get()
            ->map(fn (AtelierPayout $payout): array => [
                'id' => $payout->id,
                'atelier' => $payout->atelier?->business_name,
                'amount' => $payout->amount,
                'currency' => $payout->currency,
                'payout_key' => $payout->payout_key,
            ])
            ->values()
            ->all();

        return Inertia::render('Admin/Finance/Index', [
            'balanced' => $this->ledger->verifyLedgerBalance(),
            'accounts' => $accounts,
            'entries' => $entries,
            'pending_payouts' => $pendingPayouts,
        ]);
    }

    public function approvePayout(AtelierPayout $payout): RedirectResponse
    {
        $transaction = Transaction::query()->create([
            'booking_id' => null,
            'user_id' => $payout->atelier?->owner_user_id,
            'atelier_id' => $payout->atelier_id,
            'type' => 'atelier_payout',
            'amount' => $payout->amount,
            'currency' => $payout->currency,
            'payment_method' => 'bank_transfer',
            'status' => 'captured',
            'idempotency_key' => 'payout-'.$payout->id,
        ]);

        $this->settlements->processPayout($payout, $transaction);

        return back()->with('success', 'Payout approved and executed.');
    }
}
