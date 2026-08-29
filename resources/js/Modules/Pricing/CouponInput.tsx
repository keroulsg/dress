import { Check, Tag } from 'lucide-react';
import * as React from 'react';

import { LoadingSpinner } from '../../Components/Feedback/LoadingSpinner';
import { formatCurrency } from '../../Lib/currency';
import { cn } from '../../Lib/utils';
import type { Money } from '../../types/contracts';

export interface CouponInputProps {
    value: string;
    onChange: (code: string) => void;
    onValidate?: (code: string) => Promise<boolean>;
    loading?: boolean;
    applied?: { code: string; discount: Money } | null;
    error?: string | null;
}

/** Modern coupon field with validation, applied badge, and inline status. */
export function CouponInput({ value, onChange, onValidate, loading = false, applied = null, error = null }: CouponInputProps) {
    const canApply = onValidate !== undefined && value.trim().length > 0 && !loading && applied === null;

    const handleApply = () => {
        if (!onValidate || value.trim().length === 0 || loading || applied !== null) {
            return;
        }

        void onValidate(value.trim());
    };

    return (
        <div className="space-y-2">
            <label htmlFor="coupon-code" className="text-xs font-semibold uppercase tracking-luxe text-stone-muted">
                Coupon code
            </label>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-muted" aria-hidden="true" />
                    <input
                        id="coupon-code"
                        type="text"
                        value={value}
                        disabled={applied !== null}
                        onChange={(event) => onChange(event.target.value.toUpperCase())}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                handleApply();
                            }
                        }}
                        placeholder="WELCOME10"
                        autoComplete="off"
                        spellCheck={false}
                        aria-invalid={error !== null}
                        aria-describedby={error !== null ? 'coupon-status' : undefined}
                        className={cn(
                            'w-full rounded-none border border-stone-line bg-white py-2.5 pl-9 pr-3 text-sm uppercase tracking-wider text-charcoal placeholder:text-stone-muted',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose disabled:cursor-not-allowed disabled:opacity-60',
                            error !== null && 'border-danger',
                        )}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleApply}
                    disabled={!canApply}
                    className={cn(
                        'shrink-0 bg-champagne px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                >
                    Apply
                </button>
            </div>

            <div id="coupon-status" aria-live="polite" className="min-h-4 text-sm">
                {loading ? <LoadingSpinner className="text-xs" label="Validating coupon…" /> : null}

                {!loading && applied !== null ? (
                    <p className="flex items-center gap-1.5 text-success">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span>
                            {applied.code} applied · −{formatCurrency(applied.discount.amount, applied.discount.currency)}
                        </span>
                    </p>
                ) : null}

                {!loading && applied === null && error !== null ? <p className="text-danger">{error}</p> : null}
            </div>
        </div>
    );
}