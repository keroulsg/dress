import { Info, X } from 'lucide-react';
import * as React from 'react';

import { formatCurrency, isZeroAmount } from '../../Lib/currency';
import { cn } from '../../Lib/utils';
import type { PricingBreakdown } from '../../types/contracts';

export interface PricingBreakdownWidgetProps {
    breakdown: PricingBreakdown;
    onRemoveCoupon?: () => void;
    onToggleDelivery?: (checked: boolean) => void;
    deliveryRequested?: boolean;
}

interface RowProps {
    label: React.ReactNode;
    value: React.ReactNode;
    bold?: boolean;
    muted?: boolean;
}

function Row({ label, value, bold = false, muted = false }: RowProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
            <span className={cn('text-charcoal', muted && 'text-stone-muted', bold && 'font-semibold')}>{label}</span>
            <span className={cn('text-right text-charcoal', muted && 'text-stone-muted', bold && 'font-semibold')}>{value}</span>
        </div>
    );
}

/** Itemized luxury quote breakdown. The deposit is a refundable hold, never revenue. */
export function PricingBreakdownWidget({
    breakdown,
    onRemoveCoupon,
    onToggleDelivery,
    deliveryRequested = false,
}: PricingBreakdownWidgetProps) {
    const currency = breakdown.currency;
    const hasDelivery = !isZeroAmount(breakdown.delivery_fee.amount);
    const hasDiscount = !isZeroAmount(breakdown.discount_amount.amount);
    const taxPercent = Math.round(breakdown.tax_rate * 100);

    return (
        <section aria-label="Price breakdown" className="border border-stone-line bg-white p-5 sm:p-6">
            <h3 className="font-display text-2xl font-semibold text-charcoal">Price breakdown</h3>

            <div className="mt-4">
                <Row
                    label={
                        <>
                            Rental · {breakdown.rental_days} {breakdown.rental_days === 1 ? 'day' : 'days'} ×{' '}
                            {formatCurrency(breakdown.daily_rate.amount, currency)}
                        </>
                    }
                    value={formatCurrency(breakdown.subtotal.amount, currency)}
                />
                <Row label="Mandatory dry cleaning & preservation" value={formatCurrency(breakdown.cleaning_fee.amount, currency)} />
                {hasDelivery ? (
                    <Row label="Regional delivery & white-glove handover" value={formatCurrency(breakdown.delivery_fee.amount, currency)} />
                ) : null}
                <Row label={`VAT / sales tax · ${taxPercent}%`} value={formatCurrency(breakdown.tax_amount.amount, currency)} />

                {hasDiscount && onRemoveCoupon ? (
                    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
                        <span className="flex items-center gap-2 text-stone-muted">
                            Promotional discount
                            <button
                                type="button"
                                onClick={onRemoveCoupon}
                                aria-label="Remove promotional discount"
                                className="inline-flex items-center gap-1 rounded-full border border-champagne/50 bg-champagne/10 px-2 py-0.5 text-[11px] font-medium text-rose-deep transition-colors hover:bg-champagne/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                            >
                                <X className="h-3 w-3" aria-hidden="true" />
                                Remove
                            </button>
                        </span>
                        <span className="text-right text-stone-muted">−{formatCurrency(breakdown.discount_amount.amount, currency)}</span>
                    </div>
                ) : hasDiscount ? (
                    <Row muted label="Promotional discount" value={`−${formatCurrency(breakdown.discount_amount.amount, currency)}`} />
                ) : null}
            </div>

            <div className="mt-2 border-t border-stone-line pt-3">
                <Row bold label="Chargeable total" value={formatCurrency(breakdown.chargeable_total.amount, currency)} />
                <p className="text-xs text-stone-muted">Amount charged now</p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border border-champagne/25 bg-champagne/10 px-4 py-3">
                <span className="flex items-center gap-1.5 text-sm text-charcoal">
                    Refundable security deposit
                    <span
                        role="img"
                        aria-label="100% refunded after post-event quality inspection"
                        title="100% refunded after post-event quality inspection"
                        className="text-stone-muted"
                    >
                        <Info className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                </span>
                <span className="text-sm font-semibold text-charcoal">{formatCurrency(breakdown.security_deposit.amount, currency)}</span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-stone-line pt-4">
                <span className="text-sm font-medium text-charcoal">Grand total at authorization</span>
                <span className="font-display text-2xl font-semibold text-charcoal">
                    {formatCurrency(breakdown.grand_total.amount, currency)}
                </span>
            </div>

            {onToggleDelivery ? (
                <div className="mt-4 border-t border-stone-line pt-4">
                    <label className="flex cursor-pointer items-center justify-between gap-4">
                        <span className="text-sm text-charcoal">Regional delivery & white-glove handover</span>
                        <span className="relative inline-flex">
                            <input
                                type="checkbox"
                                checked={deliveryRequested}
                                onChange={(event) => onToggleDelivery(event.target.checked)}
                                className="peer sr-only"
                            />
                            <span
                                aria-hidden="true"
                                className="h-5 w-9 rounded-full bg-stone-line transition-colors peer-checked:bg-champagne peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-rose peer-focus-visible:ring-offset-1"
                            />
                            <span
                                aria-hidden="true"
                                className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"
                            />
                        </span>
                    </label>
                    <p className="mt-1 text-xs text-stone-muted">
                        {deliveryRequested && hasDelivery
                            ? `Included · ${formatCurrency(breakdown.delivery_fee.amount, currency)}`
                            : 'Arrives at your doorstep with a white-glove handover.'}
                    </p>
                </div>
            ) : null}
        </section>
    );
}