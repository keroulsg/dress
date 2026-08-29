/**
 * Atelier earnings card — payout balance, escrow and lifetime earnings.
 */

import { useState, type FormEvent } from 'react';
import { Wallet } from 'lucide-react';

import { LoadingSpinner } from '../../Components/Feedback/LoadingSpinner';
import { Button } from '../../Components/UI/Button';
import { Input } from '../../Components/UI/Input';
import { formatCompact, formatCurrency } from '../../Lib/currency';

export interface AtelierEarningsCardProps {
    available: { amount: string; currency: string };
    inEscrow?: { amount: string; currency: string } | null;
    totalEarned?: { amount: string; currency: string } | null;
    minimumPayout?: number;
    onRequestPayout?: (amount: string) => void;
    payoutProcessing?: boolean;
}

const EARNINGS_TITLE_ID = 'atelier-earnings-title';

export function AtelierEarningsCard({
    available,
    inEscrow,
    totalEarned,
    minimumPayout = 100,
    onRequestPayout,
    payoutProcessing = false,
}: AtelierEarningsCardProps) {
    const availableAmount = Number(available.amount);
    const belowMinimum = availableAmount < minimumPayout;
    const [payoutOpen, setPayoutOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!onRequestPayout) {
            return;
        }

        onRequestPayout(payoutAmount);
        setPayoutOpen(false);
        setPayoutAmount('');
    };

    return (
        <section aria-labelledby={EARNINGS_TITLE_ID} className="border border-stone-line bg-white shadow-subtle">
            <div className="flex items-center justify-between gap-4 border-b border-stone-line px-6 py-5">
                <div>
                    <h3 id={EARNINGS_TITLE_ID} className="font-display text-2xl font-semibold text-charcoal">
                        Atelier earnings
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-luxe text-stone-muted">Payout balance</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center bg-champagne/15">
                    <Wallet className="h-5 w-5 text-champagne" aria-hidden="true" />
                </span>
            </div>

            <div className="grid gap-px bg-stone-line sm:grid-cols-3">
                <div className="flex flex-col bg-white p-6">
                    <p className="text-xs font-medium uppercase tracking-luxe text-stone-muted">Available for payout</p>
                    <p className="mt-2 font-display text-3xl font-semibold text-champagne" aria-live="polite">
                        {formatCurrency(available.amount, available.currency)}
                    </p>

                    {payoutProcessing ? (
                        <LoadingSpinner className="mt-4" label="Processing payout…" />
                    ) : payoutOpen ? (
                        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
                            <Input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={payoutAmount}
                                onChange={(event) => setPayoutAmount(event.target.value)}
                                placeholder="Amount"
                                aria-label="Payout amount"
                                required
                            />
                            <div className="flex gap-2">
                                <Button type="submit" variant="primary" size="sm" disabled={!onRequestPayout}>
                                    Request
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setPayoutOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <Button
                            type="button"
                            variant="champagne"
                            size="sm"
                            className="mt-4 self-start"
                            onClick={() => setPayoutOpen(true)}
                            disabled={belowMinimum || !onRequestPayout}
                            title={
                                belowMinimum
                                    ? `Minimum payout is ${formatCurrency(minimumPayout, available.currency)}`
                                    : undefined
                            }
                            aria-label="Request payout"
                        >
                            Request payout
                        </Button>
                    )}
                </div>

                <div className="flex flex-col bg-white p-6">
                    <p className="text-xs font-medium uppercase tracking-luxe text-stone-muted">In escrow</p>
                    <p className="mt-2 font-display text-3xl font-semibold text-charcoal">
                        {inEscrow ? formatCurrency(inEscrow.amount, inEscrow.currency) : '—'}
                    </p>
                    <p className="mt-auto pt-3 text-xs text-stone-muted">Held against active rentals</p>
                </div>

                <div className="flex flex-col bg-white p-6">
                    <p className="text-xs font-medium uppercase tracking-luxe text-stone-muted">Total earned</p>
                    <p className="mt-2 font-display text-3xl font-semibold text-charcoal">
                        {totalEarned ? formatCompact(totalEarned.amount, totalEarned.currency) : '—'}
                    </p>
                    <p className="mt-auto pt-3 text-xs text-stone-muted">All-time earnings</p>
                </div>
            </div>
        </section>
    );
}