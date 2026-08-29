<?php

declare(strict_types=1);

namespace App\Modules\Finance\Http\Controllers\Atelier;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Finance\Domain\Contracts\LedgerContract;
use App\Modules\Finance\Domain\Contracts\SettlementContract;
use App\Modules\Finance\Domain\Entities\AtelierPayout;
use App\Modules\Finance\Domain\Exceptions\InsufficientPayoutBalanceException;
use App\Modules\Finance\Http\Requests\RequestPayoutRequest;
use App\Modules\Finance\Infrastructure\Repositories\LedgerRepository;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AtelierFinanceController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly LedgerContract $ledger,
        private readonly SettlementContract $settlements,
        private readonly LedgerRepository $repository,
    ) {}

    public function index(Atelier $atelier): Response
    {
        $available = $this->ledger->getAtelierAvailableBalance($atelier->id);

        $payouts = AtelierPayout::query()
            ->where('atelier_id', $atelier->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (AtelierPayout $payout): array => [
                'id' => $payout->id,
                'amount' => $payout->amount,
                'currency' => $payout->currency,
                'status' => $payout->status,
                'paid_at' => $payout->paid_at?->toDateTimeString(),
            ])
            ->values()
            ->all();

        return Inertia::render('Atelier/Finance/Index', [
            'atelier' => ['id' => $atelier->id, 'business_name' => $atelier->business_name],
            'available' => $available->jsonSerialize(),
            'payouts' => $payouts,
        ]);
    }

    public function requestPayout(RequestPayoutRequest $request, Atelier $atelier): RedirectResponse
    {
        $this->authorize('update', $atelier);

        try {
            $this->settlements->createPayout(
                $atelier->id,
                Money::fromDecimal((float) $request->input('amount'), 'EGP'),
                'PAY-'.strtoupper(Str::random(10)),
            );
        } catch (InsufficientPayoutBalanceException $exception) {
            return back()->withErrors(['amount' => $exception->getMessage()]);
        }

        return back()->with('success', 'Payout requested.');
    }
}
