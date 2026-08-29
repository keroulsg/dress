/**
 * Price summary — display-only booking cost breakdown.
 * Server pricing is authoritative; this card renders a preview.
 */

import { formatCurrency } from '../../Lib/currency';
import { cn } from '../../Lib/utils';

export interface PriceSummaryLine {
    label: string;
    amount: string;
    currency: string;
    muted?: boolean;
}

export interface PriceSummaryCardProps {
    dailyRate: { amount: string; currency: string };
    rentalDays: number;
    cleaningFee: { amount: string; currency: string };
    securityDeposit: { amount: string; currency: string };
    taxRate?: number;
    discountAmount?: { amount: string; currency: string } | null;
}

function roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
}

export function PriceSummaryCard({
    dailyRate,
    rentalDays,
    cleaningFee,
    securityDeposit,
    taxRate = 0.14,
    discountAmount = null,
}: PriceSummaryCardProps) {
    const currency = dailyRate.currency;

    const daily = Math.max(0, Number(dailyRate.amount) || 0);
    const rentalSubtotal = roundCurrency(daily * rentalDays);
    const discount = discountAmount ? Math.max(0, Number(discountAmount.amount) || 0) : 0;
    const taxableBase = Math.max(0, rentalSubtotal - discount);
    const tax = roundCurrency(taxableBase * taxRate);
    const cleaning = Math.max(0, Number(cleaningFee.amount) || 0);
    const deposit = Math.max(0, Number(securityDeposit.amount) || 0);
    const totalDue = roundCurrency(rentalSubtotal + cleaning + tax + deposit);

    const lines: PriceSummaryLine[] = [
        {
            label: `Rental · ${rentalDays} ${rentalDays === 1 ? 'day' : 'days'}`,
            amount: String(rentalSubtotal),
            currency,
        },
        { label: 'Mandatory dry cleaning', amount: String(cleaning), currency },
        { label: 'Taxes & fees', amount: String(tax), currency },
        ...(discountAmount
            ? [{ label: 'Discount', amount: String(discount), currency, muted: true }]
            : []),
    ];

    return (
        <div aria-label="Price summary" className="border border-stone-line bg-white shadow-subtle">
            <div className="p-6">
                <p className="text-xs uppercase tracking-luxe text-stone-muted">Price summary</p>
                <ul className="mt-4 space-y-2.5">
                    {lines.map((line) => (
                        <li
                            key={line.label}
                            className={cn(
                                'flex items-baseline justify-between gap-4 text-sm',
                                line.muted ? 'text-stone-muted' : 'text-charcoal',
                            )}
                        >
                            <span className={cn(line.muted && 'line-through')}>{line.label}</span>
                            <span className={cn('tabular-nums', !line.muted && 'font-medium')}>
                                {formatCurrency(line.amount, line.currency)}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="my-4 h-px bg-stone-line" aria-hidden="true" />

                <div className="flex items-baseline justify-between gap-4">
                    <span className="font-display text-lg text-charcoal">Total due</span>
                    <span className="font-display text-2xl tabular-nums text-charcoal">
                        {formatCurrency(totalDue, currency)}
                    </span>
                </div>
            </div>

            <div className="border-t border-stone-line bg-ivory p-6">
                <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium text-charcoal">Refundable security deposit</span>
                    <span className="text-sm font-semibold tabular-nums text-charcoal">
                        {formatCurrency(deposit, currency)}
                    </span>
                </div>
                <p className="mt-2 text-xs text-stone-muted">
                    Deposit returned after inspection if no damage or late fees apply.
                </p>
            </div>
        </div>
    );
}