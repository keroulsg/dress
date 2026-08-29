/**
 * Secure checkout — payment method selection with a mock sandbox gateway.
 *
 * Real gateway tokens are captured by the provider's SDK in a later phase.
 * This form submits an idempotent authorization request and lets the server
 * redirect to the gateway or straight to the success page.
 */

import { useForm } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Apple, CreditCard, Landmark, Loader2, Lock, ShieldCheck, Smartphone } from 'lucide-react';
import * as React from 'react';

import { Badge } from '../../Components/UI/Badge';
import { Button } from '../../Components/UI/Button';
import { cn } from '../../Lib/utils';

export interface SecureCheckoutFormProps {
    bookingId: number;
    onSuccess?: () => void;
    onDecline?: (message: string) => void;
}

type PaymentMethodId = 'card' | 'mada' | 'knet' | 'apple_pay' | 'sandbox';

type MockCardChoice = 'mock_card_success' | 'mock_card_3ds' | 'mock_card_declined';

interface CheckoutFormData {
    payment_method: string;
    idempotency_token: string;
    /** Server-side authorization error surfaced on this field. */
    payment?: string;
}

const PAYMENT_METHODS: ReadonlyArray<{
    id: PaymentMethodId;
    label: string;
    icon: LucideIcon;
    note: string;
    detail: string;
}> = [
    {
        id: 'card',
        label: 'Credit Card',
        icon: CreditCard,
        note: 'Visa · Mastercard · Amex',
        detail: 'Your card details are captured by the card network on the gateway page.',
    },
    {
        id: 'mada',
        label: 'Mada',
        icon: Landmark,
        note: 'Saudi national network',
        detail: 'Mada cards are processed through the Saudi Payments gateway.',
    },
    {
        id: 'knet',
        label: 'KNET',
        icon: Smartphone,
        note: 'Kuwait national network',
        detail: 'KNET payments are authorized via the Kuwait clearing system.',
    },
    {
        id: 'apple_pay',
        label: 'Apple Pay',
        icon: Apple,
        note: 'Express checkout',
        detail: 'Apple Pay authorizes with your device biometrics on the gateway page.',
    },
    {
        id: 'sandbox',
        label: 'Sandbox Card',
        icon: ShieldCheck,
        note: 'Test gateway',
        detail: 'Simulate the gateway outcome with a mock card.',
    },
];

const MOCK_CARDS: ReadonlyArray<{
    choice: MockCardChoice;
    label: string;
    hint: string;
    tone: 'success' | 'warning' | 'danger';
}> = [
    { choice: 'mock_card_success', label: 'Success card', hint: 'Payment approved', tone: 'success' },
    { choice: 'mock_card_3ds', label: '3DS challenge card', hint: 'Prompt required', tone: 'warning' },
    { choice: 'mock_card_declined', label: 'Declined card', hint: 'Insufficient funds', tone: 'danger' },
];

const DEFAULT_SANDBOX_CHOICE: MockCardChoice = 'mock_card_success';

export function SecureCheckoutForm({ bookingId, onSuccess, onDecline }: SecureCheckoutFormProps) {
    const [idempotencyToken] = React.useState<string>(() => crypto.randomUUID());
    const [activeMethod, setActiveMethod] = React.useState<PaymentMethodId>('card');
    const [mockChoice, setMockChoice] = React.useState<MockCardChoice | null>(null);

    const form = useForm<CheckoutFormData>({
        payment_method: 'card',
        idempotency_token: idempotencyToken,
    });

    const activeMethodMeta = PAYMENT_METHODS.find((method) => method.id === activeMethod);
    const selectedMock = mockChoice !== null ? MOCK_CARDS.find((mock) => mock.choice === mockChoice) ?? null : null;

    const handleMethodChange = (method: PaymentMethodId): void => {
        setActiveMethod(method);
        if (method === 'sandbox') {
            const choice = mockChoice ?? DEFAULT_SANDBOX_CHOICE;
            setMockChoice(choice);
            form.setData('payment_method', choice);
        } else {
            form.setData('payment_method', method);
        }
    };

    const handleMockChoice = (choice: MockCardChoice): void => {
        setMockChoice(choice);
        form.setData('payment_method', choice);
    };

    const handlePay = (): void => {
        form.post(`/checkout/${bookingId}/pay`, {
            preserveScroll: true,
            onSuccess: () => onSuccess?.(),
            onError: (errors) => onDecline?.(errors.payment ?? 'Your payment could not be completed.'),
        });
    };

    return (
        <section aria-label="Secure checkout" className="w-full max-w-lg border border-stone-line bg-white shadow-lifted">
            {/* Brand lockup */}
            <div className="flex items-center gap-4 border-b border-stone-line px-6 py-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-charcoal font-display text-xl text-champagne">
                    B
                </div>
                <div className="min-w-0">
                    <p className="font-display text-lg leading-tight text-charcoal">Bespoke Atelier</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] uppercase tracking-luxe text-stone-muted">
                        <Lock className="h-3 w-3 text-champagne" aria-hidden="true" />
                        Secured by Sandbox Gateway
                    </p>
                </div>
            </div>

            <div className="px-6 pb-6 pt-5">
                {/* Payment method tabs */}
                <div role="tablist" aria-label="Payment method" className="grid grid-cols-5 gap-1 border border-stone-line bg-ivory p-1">
                    {PAYMENT_METHODS.map((method) => {
                        const Icon = method.icon;
                        const selected = activeMethod === method.id;

                        return (
                            <button
                                key={method.id}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                aria-controls={`payment-panel-${method.id}`}
                                onClick={() => handleMethodChange(method.id)}
                                className={cn(
                                    'flex flex-col items-center gap-1 px-0.5 py-2.5 text-[9px] font-medium uppercase leading-tight tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                    selected
                                        ? 'bg-white text-rose-deep shadow-subtle'
                                        : 'text-stone-muted hover:bg-white/60 hover:text-charcoal',
                                )}
                            >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                {method.label}
                            </button>
                        );
                    })}
                </div>

                {/* Active method panel */}
                <div
                    role="tabpanel"
                    id={`payment-panel-${activeMethod}`}
                    aria-label={activeMethodMeta?.label}
                    className="mt-5"
                >
                    {activeMethod === 'sandbox' ? (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-luxe text-stone-muted">
                                Sandbox mock card
                            </p>
                            <p className="mt-1 text-sm text-stone-muted">
                                Pick a mock card to simulate the gateway outcome before the real SDK is wired up.
                            </p>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {MOCK_CARDS.map((mock) => {
                                    const selected = mockChoice === mock.choice;

                                    return (
                                        <button
                                            key={mock.choice}
                                            type="button"
                                            onClick={() => handleMockChoice(mock.choice)}
                                            aria-pressed={selected}
                                            className={cn(
                                                'flex flex-col items-start gap-0.5 border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                                selected
                                                    ? 'border-champagne bg-champagne/10'
                                                    : 'border-stone-line bg-white hover:border-champagne/60',
                                            )}
                                        >
                                            <span className="text-xs font-medium text-charcoal">{mock.label}</span>
                                            <span className="text-[11px] text-stone-muted">{mock.hint}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedMock !== null ? (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-[11px] uppercase tracking-wider text-stone-muted">Selected</span>
                                    <Badge tone={selectedMock.tone}>{selectedMock.label}</Badge>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 border border-dashed border-stone-line bg-ivory px-4 py-4">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-champagne" aria-hidden="true" />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-luxe text-charcoal">
                                    {activeMethodMeta?.note}
                                </p>
                                <p className="mt-1 text-sm text-stone-muted">{activeMethodMeta?.detail}</p>
                            </div>
                        </div>
                    )}
                </div>

                {form.errors.payment ? (
                    <p role="alert" className="mt-4 border-l-2 border-danger bg-danger/5 px-3 py-2 text-sm text-danger">
                        {form.errors.payment}
                    </p>
                ) : null}

                <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="mt-6 w-full"
                    disabled={form.processing}
                    onClick={handlePay}
                >
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Pay securely
                </Button>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-stone-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-champagne" aria-hidden="true" />
                    Your card is not stored on our servers.
                </div>
            </div>

            {form.processing ? (
                <div
                    className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-charcoal/70"
                    role="status"
                    aria-live="assertive"
                >
                    <Loader2 className="h-9 w-9 animate-spin text-champagne" aria-hidden="true" />
                    <p className="font-display text-2xl text-white">Authorizing…</p>
                    <p className="text-xs uppercase tracking-luxe text-white/60">Please do not close this window</p>
                </div>
            ) : null}
        </section>
    );
}