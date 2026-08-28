/**
 * Pricing module — public surface.
 */

import { formatCurrency, isZeroAmount } from '../../Lib/currency';
import type { PricingBreakdown } from '../../types/contracts';

export type { PricingBreakdown };

interface PriceRowProps {
    label: string;
    amount: string;
    currency: string;
    muted?: boolean;
}

function PriceRow({ label, amount, currency, muted = false }: PriceRowProps) {
    return (
        <div className="flex items-center justify-between py-1.5 text-sm">
            <span className={muted ? 'text-stone-muted' : 'text-charcoal'}>{label}</span>
            <span className={muted ? 'text-stone-muted' : 'font-medium text-charcoal'}>
                {formatCurrency(amount, currency)}
            </span>
        </div>
    );
}

export interface PriceBreakdownProps {
    breakdown: PricingBreakdown;
}

/**
 * Server-side pricing breakdown. The security deposit is shown separately as
 * a refundable hold, never as revenue.
 */
export function PriceBreakdown({ breakdown }: PriceBreakdownProps) {
    const currency = breakdown.currency;

    return (
        <div className="border border-stone-line bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-luxe text-stone-muted">Price breakdown</p>
            <PriceRow
                label={`Rental · ${breakdown.rental_days} ${breakdown.rental_days === 1 ? 'day' : 'days'}`}
                amount={breakdown.rental_subtotal.amount}
                currency={currency}
            />
            <PriceRow label="Cleaning fee" amount={breakdown.cleaning_fee.amount} currency={currency} />
            <PriceRow label="Taxes & fees" amount={breakdown.tax_amount.amount} currency={currency} />
            {!isZeroAmount(breakdown.discount_amount.amount) ? (
                <PriceRow label="Discount" amount={breakdown.discount_amount.amount} currency={currency} muted />
            ) : null}

            <div className="mt-3 border-t border-stone-line pt-3">
                <PriceRow label="Amount charged now" amount={breakdown.amount_chargeable.amount} currency={currency} />
            </div>

            <div className="mt-2 flex items-center justify-between rounded-none bg-ivory px-3 py-2.5 text-sm">
                <span className="text-stone-muted">Refundable deposit</span>
                <span className="font-semibold text-charcoal">{formatCurrency(breakdown.security_deposit.amount, currency)}</span>
            </div>

            <p className="mt-3 border-t border-stone-line pt-3 text-xs text-stone-muted">
                Total held: <span className="font-medium text-charcoal">{formatCurrency(breakdown.grand_total.amount, currency)}</span> —
                the deposit is returned after inspection if no damage or late fees apply.
            </p>
        </div>
    );
}