/**
 * Booking wizard — multi-step checkout for a dress rental.
 */

import { useForm } from '@inertiajs/react';
import { Check, CheckCircle2 } from 'lucide-react';
import * as React from 'react';

import { Alert } from '../../Components/Feedback/Alert';
import { Button } from '../../Components/UI/Button';
import { Input } from '../../Components/UI/Input';
import { Select } from '../../Components/UI/Select';
import { Textarea } from '../../Components/UI/Textarea';
import { formatCurrency } from '../../Lib/currency';
import { rentalDayCount } from '../../Lib/dates';
import { cn } from '../../Lib/utils';
import {
    AvailabilityCalendarGrid,
    useMonthAvailability,
} from '../Availability/AvailabilityCalendarGrid';
import { PriceSummaryCard } from './PriceSummaryCard';

export interface BookingWizardDress {
    id: number;
    title: string;
    slug: string;
    atelier_id: number;
    primary_image: string | null;
    rental_price_per_day: { amount: string; currency: string };
    security_deposit_amount: { amount: string; currency: string };
    cleaning_fee: { amount: string; currency: string };
    late_fee_per_day: { amount: string; currency: string };
    turnaround_buffer_days: number;
    sizes: string[];
}

export interface BookingWizardProps {
    dress: BookingWizardDress;
}

interface BookingFormData {
    dress_id: number;
    dress_size_id: string;
    start_date: string;
    end_date: string;
    fitting_datetime: string | null;
    delivery_address: string;
    phone: string;
    notes: string;
    client_token: string;
}

const STEPS = [
    { key: 'dates', label: 'Dates & Fitting' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'review', label: 'Review' },
    { key: 'payment', label: 'Payment' },
] as const;

const TAX_RATE = 0.14;

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="mb-1.5 block text-xs uppercase tracking-luxe text-stone-muted">
            {children}
        </label>
    );
}

function FieldError({ message }: { message?: string | null }) {
    return message ? <p className="mt-1.5 text-xs text-danger">{message}</p> : null;
}

function todayKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function BookingWizard({ dress }: BookingWizardProps) {
    const [today] = React.useState(() => new Date());
    const [month, setMonth] = React.useState(() => ({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
    }));
    const [clientToken] = React.useState<string>(() => crypto.randomUUID());

    const [step, setStep] = React.useState(0);
    const [stepError, setStepError] = React.useState<string | null>(null);
    const [startDate, setStartDate] = React.useState<string | null>(null);
    const [endDate, setEndDate] = React.useState<string | null>(null);
    const [fittingRequested, setFittingRequested] = React.useState(false);
    const [fittingDatetime, setFittingDatetime] = React.useState('');

    const form = useForm<BookingFormData>({
        dress_id: dress.id,
        dress_size_id: '',
        start_date: '',
        end_date: '',
        fitting_datetime: null,
        delivery_address: '',
        phone: '',
        notes: '',
        client_token: clientToken,
    });

    const { data, loading } = useMonthAvailability(dress.id, month.year, month.month);

    const rentalDays = startDate !== null && endDate !== null ? rentalDayCount(startDate, endDate) : 0;

    const handleSelectRange = (start: string | null, end: string | null): void => {
        setStartDate(start);
        setEndDate(end);
        if (start !== null) {
            form.setData('start_date', start);
        }
        if (end !== null) {
            form.setData('end_date', end);
        }
    };

    const handleFittingRequested = (checked: boolean): void => {
        setFittingRequested(checked);
        if (!checked) {
            setFittingDatetime('');
            form.setData('fitting_datetime', null);
        }
    };

    const handleFittingDatetime = (value: string): void => {
        setFittingDatetime(value);
        form.setData('fitting_datetime', value || null);
    };

    const validateStepOne = (): boolean => {
        setStepError(null);
        if (startDate === null || endDate === null) {
            setStepError('Please select your rental dates on the calendar.');
            return false;
        }
        if (fittingRequested) {
            if (fittingDatetime === '') {
                setStepError('Please choose a date and time for your fitting.');
                return false;
            }
            if (fittingDatetime.slice(0, 10) >= startDate) {
                setStepError('Fitting must be scheduled before your rental start date.');
                return false;
            }
        }

        return true;
    };

    const validateStepTwo = (): boolean => {
        setStepError(null);
        if (form.data.dress_size_id === '') {
            setStepError('Please choose your size.');
            return false;
        }
        if (form.data.delivery_address.trim() === '') {
            setStepError('Delivery address is required.');
            return false;
        }

        return true;
    };

    const handleContinue = (): void => {
        const valid = step === 0 ? validateStepOne() : validateStepTwo();
        if (valid) {
            setStep((current) => current + 1);
        }
    };

    const submit = (): void => {
        form.post(`/checkout/${dress.id}`, {
            onSuccess: () => setStep(3),
        });
    };

    return (
        <div>
            <div className="sticky top-0 z-20 border-b border-stone-line bg-ivory/95 backdrop-blur">
                <ol className="flex items-center gap-4 overflow-x-auto py-4" aria-label="Booking steps">
                    {STEPS.map((item, index) => {
                        const done = index < step;
                        const current = index === step;

                        return (
                            <li key={item.key} className="flex shrink-0 items-center gap-2">
                                <span
                                    className={cn(
                                        'flex items-center gap-2',
                                        current || done ? '' : 'text-stone-muted',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors',
                                            done
                                                ? 'border-champagne bg-champagne text-charcoal'
                                                : current
                                                  ? 'border-charcoal bg-charcoal text-white'
                                                  : 'border-stone-line bg-white text-stone-muted',
                                        )}
                                    >
                                        {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                                    </span>
                                    <span className="whitespace-nowrap text-xs uppercase tracking-luxe">
                                        {item.label}
                                    </span>
                                </span>
                                {index < STEPS.length - 1 ? (
                                    <span className="h-px w-6 bg-stone-line" aria-hidden="true" />
                                ) : null}
                            </li>
                        );
                    })}
                </ol>
            </div>

            <div className="mt-8 flex items-center gap-4">
                <div className="h-16 w-12 shrink-0 overflow-hidden bg-stone-line/40">
                    {dress.primary_image ? (
                        <img src={dress.primary_image} alt={dress.title} className="h-full w-full object-cover" />
                    ) : null}
                </div>
                <div className="min-w-0">
                    <p className="font-display text-2xl text-charcoal">{dress.title}</p>
                    <p className="text-sm text-stone-muted">
                        {formatCurrency(
                            dress.rental_price_per_day.amount,
                            dress.rental_price_per_day.currency,
                        )}{' '}
                        / day
                    </p>
                </div>
            </div>

            <div className="mt-8">
                {step === 0 ? (
                    <section aria-label="Dates and fitting" className="space-y-6">
                        {loading ? (
                            <p className="text-sm text-stone-muted" aria-live="polite">
                                Loading availability…
                            </p>
                        ) : null}

                        <AvailabilityCalendarGrid
                            dressId={dress.id}
                            month={month}
                            bufferDays={data?.buffer_days ?? dress.turnaround_buffer_days}
                            days={data?.days ?? {}}
                            minDate={todayKey(today)}
                            selectedStart={startDate}
                            selectedEnd={endDate}
                            onSelectRange={handleSelectRange}
                            onMonthChange={(year, monthNumber) => setMonth({ year, month: monthNumber })}
                        />

                        <FieldError message={form.errors.start_date} />
                        <FieldError message={form.errors.end_date} />

                        <div className="border-t border-stone-line pt-5">
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
                                <input
                                    type="checkbox"
                                    checked={fittingRequested}
                                    onChange={(event) => handleFittingRequested(event.target.checked)}
                                    className="h-4 w-4 rounded-none border-stone-line text-champagne focus-visible:ring-rose"
                                />
                                Request a fitting
                            </label>
                            <p className="mt-1 pl-6 text-xs text-stone-muted">
                                Optional in-atelier fitting before your rental begins.
                            </p>

                            {fittingRequested ? (
                                <div className="mt-4 max-w-sm">
                                    <FieldLabel htmlFor="fitting-datetime">Fitting date & time</FieldLabel>
                                    <Input
                                        id="fitting-datetime"
                                        type="datetime-local"
                                        value={fittingDatetime}
                                        onChange={(event) => handleFittingDatetime(event.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-stone-muted">
                                        Fitting must take place before your rental start date.
                                    </p>
                                    <FieldError message={form.errors.fitting_datetime} />
                                </div>
                            ) : null}
                        </div>

                        <FieldError message={stepError} />
                    </section>
                ) : null}

                {step === 1 ? (
                    <section aria-label="Delivery details" className="max-w-xl space-y-5">
                        <div>
                            <FieldLabel htmlFor="dress-size">Size</FieldLabel>
                            <Select
                                id="dress-size"
                                value={form.data.dress_size_id}
                                onChange={(event) => form.setData('dress_size_id', event.target.value)}
                            >
                                <option value="">Select your size</option>
                                {dress.sizes.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </Select>
                            <FieldError message={form.errors.dress_size_id} />
                        </div>

                        <div>
                            <FieldLabel htmlFor="delivery-address">Delivery address</FieldLabel>
                            <Textarea
                                id="delivery-address"
                                value={form.data.delivery_address}
                                onChange={(event) => form.setData('delivery_address', event.target.value)}
                                placeholder="Street, city, country"
                                required
                            />
                            <FieldError message={form.errors.delivery_address} />
                        </div>

                        <div>
                            <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
                            <Input
                                id="phone"
                                type="tel"
                                value={form.data.phone}
                                onChange={(event) => form.setData('phone', event.target.value)}
                            />
                        </div>

                        <div>
                            <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
                            <Textarea
                                id="notes"
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.target.value)}
                                placeholder="Anything the atelier should know"
                            />
                        </div>

                        <FieldError message={stepError} />
                    </section>
                ) : null}

                {step === 2 ? (
                    <section aria-label="Review your booking" className="max-w-xl space-y-5">
                        <PriceSummaryCard
                            dailyRate={dress.rental_price_per_day}
                            rentalDays={rentalDays}
                            cleaningFee={dress.cleaning_fee}
                            securityDeposit={dress.security_deposit_amount}
                            taxRate={TAX_RATE}
                        />
                        {form.hasErrors ? (
                            <Alert tone="danger" title="Please correct the highlighted fields.">
                                {Object.values(form.errors).join(' ')}
                            </Alert>
                        ) : null}
                    </section>
                ) : null}

                {step === 3 ? (
                    <section
                        aria-label="Booking created"
                        className="flex max-w-xl flex-col items-start gap-4 border border-stone-line bg-white p-8 shadow-subtle"
                    >
                        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
                        <h2 className="font-display text-2xl text-charcoal">Booking created — complete payment</h2>
                        <p className="text-sm text-stone-muted">
                            Your rental is reserved. Proceed to payment to confirm — real payment is enabled
                            in a later phase.
                        </p>
                        <Alert tone="info" title="Next step">
                            Payment will be collected securely once the checkout is finalized.
                        </Alert>
                    </section>
                ) : null}

                {step < 3 ? (
                    <div className="mt-8 flex items-center justify-between border-t border-stone-line pt-6">
                        {step > 0 ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep((current) => current - 1)}
                                disabled={form.processing}
                            >
                                Back
                            </Button>
                        ) : (
                            <span aria-hidden="true" />
                        )}
                        {step === 2 ? (
                            <Button
                                type="button"
                                variant="champagne"
                                onClick={submit}
                                disabled={form.processing}
                            >
                                {form.processing ? 'Placing booking…' : 'Place booking'}
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleContinue} disabled={form.processing}>
                                Continue
                            </Button>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}