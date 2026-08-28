/**
 * Payment module — public surface.
 */

import * as React from 'react';

import { cn } from '../../Lib/utils';
import { Input } from '../../Components/UI/Input';

export interface PaymentMethod {
    id: string;
    label: string;
    description: string;
}

export interface PaymentMethodSelectorProps {
    methods: PaymentMethod[];
    value: string;
    onChange: (value: string) => void;
}

/** Secure payment method selection. Details are rendered by the gateway layer. */
export function PaymentMethodSelector({ methods, value, onChange }: PaymentMethodSelectorProps) {
    return (
        <fieldset className="space-y-2">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-luxe text-stone-muted">Payment method</legend>
            {methods.map((method) => (
                <label
                    key={method.id}
                    className={cn(
                        'flex cursor-pointer items-center gap-3 border px-4 py-3 transition-colors',
                        value === method.id ? 'border-champagne bg-champagne/10' : 'border-stone-line bg-white hover:border-champagne/60',
                    )}
                >
                    <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={value === method.id}
                        onChange={() => onChange(method.id)}
                        className="h-4 w-4 accent-rose"
                    />
                    <span>
                        <span className="block text-sm font-medium text-charcoal">{method.label}</span>
                        <span className="block text-xs text-stone-muted">{method.description}</span>
                    </span>
                </label>
            ))}
        </fieldset>
    );
}

export interface CardNumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

/** Simple card input wrapper (gateway SDK replaces this in Phase 8). */
export function CardNumberInput({ label = 'Card number', ...props }: CardNumberInputProps) {
    return (
        <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-stone-muted">{label}</span>
            <Input inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" {...props} />
        </label>
    );
}