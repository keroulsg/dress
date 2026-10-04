/**
 * Booking wizard — multi-step checkout supporting dual mode:
 * 1. Renting (حجز الفستان للإيجار)
 * 2. Permanent Purchase (شراء الفستان نهائياً)
 *
 * Fitting appointment requirement is completely removed as requested.
 */

import { useForm } from '@inertiajs/react';
import { Check, CheckCircle2, ShieldCheck, ShoppingBag, Sparkles, Upload } from 'lucide-react';
import * as React from 'react';

import { Alert } from '../../Components/Feedback/Alert';
import { Button } from '../../Components/UI/Button';
import { Input } from '../../Components/UI/Input';
import { Select } from '../../Components/UI/Select';
import { Textarea } from '../../Components/UI/Textarea';
import { useLanguage } from '../../Contexts/LanguageContext';
import { formatCurrency } from '../../Lib/currency';
import { rentalDayCount } from '../../Lib/dates';
import { cn, resolveImageUrl } from '../../Lib/utils';
import {
    AvailabilityCalendarGrid,
    useMonthAvailability,
} from '../Availability/AvailabilityCalendarGrid';

export interface BookingWizardDress {
    id: number;
    title: string;
    slug: string;
    atelier_id: number;
    primary_image: string | null;
    rental_price_per_day: { amount: string; currency: string };
    original_retail_value?: { amount: string; currency: string };
    security_deposit_amount: { amount: string; currency: string };
    cleaning_fee: { amount: string; currency: string };
    late_fee_per_day: { amount: string; currency: string };
    turnaround_buffer_days: number;
    sizes: string[];
}

export interface BookingWizardProps {
    dress: BookingWizardDress;
    userKyc?: {
        is_verified: boolean;
        status: string;
    };
}

interface BookingFormData {
    dress_id: number;
    dress_size_id: string;
    start_date: string;
    end_date: string;
    delivery_address: string;
    phone: string;
    notes: string;
    client_token: string;
    id_front: File | null;
    id_back: File | null;
}

const TAX_RATE = 0.14;

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            {children}
        </label>
    );
}

function FieldError({ message }: { message?: string | null }) {
    return message ? <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{message}</p> : null;
}

function todayKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function BookingWizard({ dress, userKyc }: BookingWizardProps) {
    const { tr, isRtl } = useLanguage();
    const [orderMode, setOrderMode] = React.useState<'rent' | 'buy'>('rent');

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

    const [idFrontPreview, setIdFrontPreview] = React.useState<string | null>(null);
    const [idBackPreview, setIdBackPreview] = React.useState<string | null>(null);

    const currency = dress.rental_price_per_day.currency || 'EGP';
    const purchasePriceAmount = dress.original_retail_value?.amount
        ? dress.original_retail_value.amount
        : (Number(dress.rental_price_per_day.amount || '500') * 5).toFixed(2);

    const form = useForm<BookingFormData>({
        dress_id: dress.id,
        dress_size_id: '',
        start_date: '',
        end_date: '',
        delivery_address: '',
        phone: '',
        notes: '',
        client_token: clientToken,
        id_front: null,
        id_back: null,
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

    const handleSelectSingleDate = (date: string): void => {
        setStartDate(date);
        setEndDate(date);
        form.setData('start_date', date);
        form.setData('end_date', date);
    };

    const validateStepOne = (): boolean => {
        setStepError(null);
        if (orderMode === 'rent') {
            if (startDate === null || endDate === null) {
                setStepError(tr('يرجى تحديد تواريخ بداية ونهاية الإيجار على التقويم.', 'Please select your rental start and end dates on the calendar.'));
                return false;
            }
        } else {
            if (startDate === null) {
                setStepError(tr('يرجى تحديد موعد التوصيل والاستلام المفضل على التقويم.', 'Please choose your preferred delivery date on the calendar.'));
                return false;
            }
        }

        return true;
    };

    const validateStepTwo = (): boolean => {
        setStepError(null);
        if (form.data.dress_size_id === '') {
            setStepError(tr('يرجى اختيار المقاس المناسب لكِ.', 'Please choose your size.'));
            return false;
        }
        if (form.data.delivery_address.trim() === '') {
            setStepError(tr('عنوان التوصيل مطلوب لإتمام الطلب.', 'Delivery address is required.'));
            return false;
        }
        if (orderMode === 'rent' && !userKyc?.is_verified && (!form.data.id_front || !form.data.id_back)) {
            setStepError(tr('يرجى إرفاق صورة بطاقة الرقم القومي (الوجهين الأمامي والخلفي) لتوثيق عقد الإيجار.', 'Please upload both front and back images of your National ID.'));
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
        const orderPrefix = orderMode === 'buy' ? '[طلب شراء نهائي وتملك] ' : '[طلب حجز للإيجار] ';
        const updatedNotes = form.data.notes ? `${orderPrefix}${form.data.notes}` : orderPrefix;

        form.transform((data) => ({
            ...data,
            order_type: orderMode === 'buy' ? 'direct_sale' : 'rental',
            agree_to_terms: true,
            notes: updatedNotes,
        }));

        form.post(`/checkout/${dress.id}`, {
            onSuccess: () => setStep(3),
        });
    };

    const steps = [
        { key: 'dates', label: tr('الموعد ونوع الطلب', 'Mode & Dates') },
        { key: 'delivery', label: tr('المقاس والعنوان والتوثيق', 'Size, Address & ID') },
        { key: 'review', label: tr('مراجعة الحساب', 'Review & Total') },
        { key: 'payment', label: tr('تأكيد الطلب', 'Confirmation') },
    ];

    // Pricing calculations
    const dailyRateNum = Math.max(0, Number(dress.rental_price_per_day.amount) || 0);
    const cleaningFeeNum = Math.max(0, Number(dress.cleaning_fee.amount) || 0);
    // Security deposit defaults to exactly 25% of base rental fee
    const securityDepositNum = Math.round(dailyRateNum * 0.25);
    const purchasePriceNum = Math.max(0, Number(purchasePriceAmount) || 0);

    const rentalSubtotal = dailyRateNum; // Flat rental period fee for event window
    const totalBookingValue = rentalSubtotal + cleaningFeeNum;
    const onlineReservationFee = Math.round(totalBookingValue * 0.10);
    const offlineRentalBalance = totalBookingValue - onlineReservationFee;
    const totalDueAtAtelier = offlineRentalBalance + securityDepositNum;

    const purchaseTax = purchasePriceNum * TAX_RATE;
    const purchaseTotal = purchasePriceNum + cleaningFeeNum + purchaseTax;

    return (
        <div className="space-y-8">
            {/* Step Progress Header */}
            <div className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-4 shadow-xs">
                <ol className="flex items-center justify-between gap-2 overflow-x-auto" aria-label="Booking steps">
                    {steps.map((item, index) => {
                        const done = index < step;
                        const current = index === step;

                        return (
                            <li key={item.key} className="flex shrink-0 items-center gap-2">
                                <span
                                    className={cn(
                                        'flex items-center gap-2',
                                        current || done ? 'text-stone-900 dark:text-stone-100 font-bold' : 'text-stone-400 dark:text-stone-600',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono transition-colors',
                                            done
                                                ? 'bg-amber-600 text-white'
                                                : current
                                                  ? 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-bold'
                                                  : 'border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400',
                                        )}
                                    >
                                        {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                                    </span>
                                    <span className="whitespace-nowrap text-xs uppercase tracking-wider">
                                        {item.label}
                                    </span>
                                </span>
                                {index < steps.length - 1 ? (
                                    <span className="h-px w-6 sm:w-10 bg-stone-200 dark:bg-stone-800" aria-hidden="true" />
                                ) : null}
                            </li>
                        );
                    })}
                </ol>
            </div>

            {/* Dress Summary Banner */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-xs flex items-center gap-4">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    {dress.primary_image ? (
                        <img src={resolveImageUrl(dress.primary_image)} alt={dress.title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-stone-400 text-xs font-mono">
                            Maison
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {orderMode === 'buy' ? tr('شراء الفستان وتملكه', 'Dress Purchase') : tr('حجز للإيجار الفاخر', 'Luxury Rental')}
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 truncate">
                        {dress.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-stone-500 dark:text-stone-400">
                        <span>
                            {tr('الإيجار:', 'Rental:')}{' '}
                            <strong className="text-stone-900 dark:text-stone-100 font-mono">
                                {formatCurrency(dress.rental_price_per_day.amount, currency)} / {tr('يوم', 'day')}
                            </strong>
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">|</span>
                        <span>
                            {tr('سعر الشراء النهائي:', 'Retail Purchase:')}{' '}
                            <strong className="text-stone-900 dark:text-stone-100 font-mono">
                                {formatCurrency(purchasePriceAmount, currency)}
                            </strong>
                        </span>
                    </div>
                </div>
            </div>

            <div>
                {/* STEP 0: Choose Order Mode & Dates */}
                {step === 0 ? (
                    <section aria-label="Dates and order mode" className="space-y-6">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
                                {tr('اختاري طريقة الطلب:', 'Select Order Mode:')}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                                {tr('يمكنك استئجار الفستان لفترة مناسبتك أو شراؤه وتملكه نهائياً بدون إرجاع.', 'You can rent this gown for your event or purchase it permanently without return.')}
                            </p>

                            {/* Dual Mode Selector Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOrderMode('rent');
                                        setStepError(null);
                                    }}
                                    className={cn(
                                        'flex flex-col items-start p-5 rounded-2xl border-2 text-start transition-all cursor-pointer relative',
                                        orderMode === 'rent'
                                            ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-500 shadow-sm'
                                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700'
                                    )}
                                >
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                                                <Sparkles className="h-4 w-4" />
                                            </span>
                                            <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                                {tr('💎 حجز الفستان للإيجار', '💎 Rent This Dress')}
                                            </span>
                                        </div>
                                        {orderMode === 'rent' && (
                                            <span className="h-5 w-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                                                <Check className="h-3 w-3" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                                        {tr('استئجار فاخر لفترة المناسبة، يشمل التنظيف والكي والتجهيز وتأمين مسترد بالكامل.', 'Luxury rental for your event. Includes cleaning, prep, and fully refundable deposit.')}
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 w-full flex items-baseline justify-between">
                                        <span className="text-xs text-stone-500 dark:text-stone-400">{tr('سعر الإيجار اليومي:', 'Daily Rate:')}</span>
                                        <span className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base font-mono">
                                            {formatCurrency(dress.rental_price_per_day.amount, currency)} / {tr('يوم', 'day')}
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setOrderMode('buy');
                                        setStepError(null);
                                    }}
                                    className={cn(
                                        'flex flex-col items-start p-5 rounded-2xl border-2 text-start transition-all cursor-pointer relative',
                                        orderMode === 'buy'
                                            ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-500 shadow-sm'
                                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700'
                                    )}
                                >
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                                                <ShoppingBag className="h-4 w-4" />
                                            </span>
                                            <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                                {tr('🛍️ شراء الفستان نهائياً', '🛍️ Purchase & Own')}
                                            </span>
                                        </div>
                                        {orderMode === 'buy' && (
                                            <span className="h-5 w-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                                                <Check className="h-3 w-3" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                                        {tr('شراء وتملك دائم للفستان، لا يتطلب إرجاع بعد المناسبة، مع شحن وتغليف فاخر.', 'Permanent purchase and ownership. No returns needed, luxury packaging and delivery.')}
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 w-full flex items-baseline justify-between">
                                        <span className="text-xs text-stone-500 dark:text-stone-400">{tr('سعر الشراء النهائي:', 'Retail Price:')}</span>
                                        <span className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base font-mono">
                                            {formatCurrency(purchasePriceAmount, currency)}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Calendar Step */}
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                            <div className="mb-4">
                                <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                                    {orderMode === 'rent'
                                        ? tr('حددي تواريخ الإيجار المطلوبة (البداية والنهاية):', 'Select Rental Period (Start & Return Date):')
                                        : tr('حددي موعد التوصيل والاستلام المرغوب:', 'Select Preferred Delivery Date:')}
                                </h4>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                    {orderMode === 'rent'
                                        ? tr('انقري على يوم البداية ثم يوم النهاية لتحديد فترة الاستئجار.', 'Click your start date, then click your return date.')
                                        : tr('انقري على التاريخ المرغوب لتسليم الفستان إلى عنوانك.', 'Click the date you want the gown delivered.')}
                                </p>
                            </div>

                            {loading ? (
                                <p className="text-xs text-stone-500 dark:text-stone-400 mb-3" aria-live="polite">
                                    {tr('جاري تحميل التوافر…', 'Loading availability…')}
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
                                onSelectRange={orderMode === 'rent' ? handleSelectRange : (start) => start && handleSelectSingleDate(start)}
                                onMonthChange={(year, monthNumber) => setMonth({ year, month: monthNumber })}
                            />

                            {startDate && (
                                <div className="mt-4 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs flex items-center justify-between">
                                    <span className="text-stone-600 dark:text-stone-300">
                                        {orderMode === 'rent' ? tr('الفترة المحددة:', 'Selected Period:') : tr('تاريخ التوصيل المختار:', 'Delivery Date:')}
                                    </span>
                                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                                        {orderMode === 'rent' ? `${startDate} ← ${endDate || startDate} (${rentalDays} ${tr('أيام', 'days')})` : startDate}
                                    </span>
                                </div>
                            )}

                            <FieldError message={form.errors.start_date} />
                            <FieldError message={form.errors.end_date} />
                            <FieldError message={stepError} />
                        </div>
                    </section>
                ) : null}

                {/* STEP 1: Delivery Details & Size */}
                {step === 1 ? (
                    <section aria-label="Delivery details" className="max-w-xl space-y-5">
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-5">
                            <div>
                                <FieldLabel htmlFor="dress-size">{tr('المقاس المطلوب', 'Select Size')}</FieldLabel>
                                <Select
                                    id="dress-size"
                                    value={form.data.dress_size_id}
                                    onChange={(event) => form.setData('dress_size_id', event.target.value)}
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                                >
                                    <option value="">{tr('— اختاري مقاس الفستان —', '— Choose Your Size —')}</option>
                                    {dress.sizes.map((size) => (
                                        <option key={size} value={size}>
                                            {tr(`مقاس ${size}`, `Size ${size}`)}
                                        </option>
                                    ))}
                                </Select>
                                <FieldError message={form.errors.dress_size_id} />
                            </div>

                            <div>
                                <FieldLabel htmlFor="delivery-address">{tr('عنوان التوصيل الكامل', 'Delivery Address')}</FieldLabel>
                                <Textarea
                                    id="delivery-address"
                                    value={form.data.delivery_address}
                                    onChange={(event) => form.setData('delivery_address', event.target.value)}
                                    placeholder={tr('الشارع، رقم المبنى، الحي، المدينة، المحافظة', 'Street, building, district, city')}
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                                    required
                                />
                                <FieldError message={form.errors.delivery_address} />
                            </div>

                            <div>
                                <FieldLabel htmlFor="phone">{tr('رقم الهاتف للتواصل وتأكيد الشحن', 'Phone Number')}</FieldLabel>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={form.data.phone}
                                    onChange={(event) => form.setData('phone', event.target.value)}
                                    placeholder={tr('01xxxxxxxxx', '+20 1xxxxxxxxx')}
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="notes">{tr('ملاحظات إضافية (اختياري)', 'Additional Notes (Optional)')}</FieldLabel>
                                <Textarea
                                    id="notes"
                                    value={form.data.notes}
                                    onChange={(event) => form.setData('notes', event.target.value)}
                                    placeholder={tr('أي تفاصيل إضافية لتسليم الفستان أو الأتيليه…', 'Any special delivery instructions…')}
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                                />
                            </div>

                            {/* KYC Verification for Renting */}
                            {orderMode === 'rent' && (
                                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
                                    {userKyc?.is_verified ? (
                                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
                                            <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                            <div>
                                                <p className="text-xs font-bold">{tr('الهوية الوطنية موثقة ومطابقة', 'National ID Verified')}</p>
                                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                                                    {tr('حسابك موثق رسمياً، لستِ بحاجة لإعادة رفع مستندات الهوية.', 'Your identity is fully verified. No further uploads required.')}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                                        {tr('إثبات الهوية لتأمين عقد الإيجار (مطلوب لمرة واحدة)', 'National ID Verification (Required for Rental)')}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                    {tr('لحماية الفساتين الفاخرة، يرجى رفع صورة واضحة للوجهين الأمامي والخلفي لبطاقة الرقم القومي.', 'To protect luxury designer pieces, please upload clear photos of your National ID (front & back).')}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Front ID Dropzone */}
                                                <div>
                                                    <FieldLabel htmlFor="id-front">{tr('بطاقة الرقم القومي (الوجه الأمامي)', 'National ID (Front)')}</FieldLabel>
                                                    <div className="relative border-2 border-dashed rounded-xl border-stone-300 dark:border-stone-700 p-4 text-center hover:border-amber-500 transition-colors bg-stone-50/50 dark:bg-stone-800/40">
                                                        {idFrontPreview ? (
                                                            <div className="space-y-2">
                                                                <img src={idFrontPreview} alt="ID Front Preview" className="h-28 mx-auto object-cover rounded-lg border border-stone-200 dark:border-stone-700" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setIdFrontPreview(null);
                                                                        form.setData('id_front', null);
                                                                    }}
                                                                    className="text-xs text-rose-600 dark:text-rose-400 underline font-medium"
                                                                >
                                                                    {tr('إزالة وتغيير الصورة', 'Remove & Replace')}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label htmlFor="id-front" className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-2">
                                                                <Upload className="h-6 w-6 text-stone-400" />
                                                                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{tr('ارفعي الوجه الأمامي', 'Upload Front')}</span>
                                                                <span className="text-[10px] text-stone-400">JPG, PNG (Max 5MB)</span>
                                                                <input
                                                                    id="id-front"
                                                                    type="file"
                                                                    accept="image/jpeg,image/png,image/jpg"
                                                                    className="sr-only"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0] || null;
                                                                        form.setData('id_front', file);
                                                                        if (file) {
                                                                            setIdFrontPreview(URL.createObjectURL(file));
                                                                        } else {
                                                                            setIdFrontPreview(null);
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                    <FieldError message={form.errors.id_front} />
                                                </div>

                                                {/* Back ID Dropzone */}
                                                <div>
                                                    <FieldLabel htmlFor="id-back">{tr('بطاقة الرقم القومي (الوجه الخلفي)', 'National ID (Back)')}</FieldLabel>
                                                    <div className="relative border-2 border-dashed rounded-xl border-stone-300 dark:border-stone-700 p-4 text-center hover:border-amber-500 transition-colors bg-stone-50/50 dark:bg-stone-800/40">
                                                        {idBackPreview ? (
                                                            <div className="space-y-2">
                                                                <img src={idBackPreview} alt="ID Back Preview" className="h-28 mx-auto object-cover rounded-lg border border-stone-200 dark:border-stone-700" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setIdBackPreview(null);
                                                                        form.setData('id_back', null);
                                                                    }}
                                                                    className="text-xs text-rose-600 dark:text-rose-400 underline font-medium"
                                                                >
                                                                    {tr('إزالة وتغيير الصورة', 'Remove & Replace')}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label htmlFor="id-back" className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-2">
                                                                <Upload className="h-6 w-6 text-stone-400" />
                                                                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{tr('ارفعي الوجه الخلفي', 'Upload Back')}</span>
                                                                <span className="text-[10px] text-stone-400">JPG, PNG (Max 5MB)</span>
                                                                <input
                                                                    id="id-back"
                                                                    type="file"
                                                                    accept="image/jpeg,image/png,image/jpg"
                                                                    className="sr-only"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0] || null;
                                                                        form.setData('id_back', file);
                                                                        if (file) {
                                                                            setIdBackPreview(URL.createObjectURL(file));
                                                                        } else {
                                                                            setIdBackPreview(null);
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                    <FieldError message={form.errors.id_back} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <FieldError message={stepError} />
                        </div>
                    </section>
                ) : null}

                {/* STEP 2: Review & Price Breakdown */}
                {step === 2 ? (
                    <section aria-label="Review your booking" className="max-w-xl space-y-5">
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs overflow-hidden">
                            <div className="p-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                        {tr('ملخص الحساب والتكلفة', 'Order & Price Summary')}
                                    </span>
                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                                        {orderMode === 'buy' ? tr('🛍️ شراء وتملك نهائي', '🛍️ Permanent Purchase') : tr('💎 حجز إيجار', '💎 Rental')}
                                    </span>
                                </div>
                                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                                    {dress.title}
                                </h3>
                            </div>

                            <div className="p-6 space-y-3 text-xs">
                                {orderMode === 'rent' ? (
                                    <>
                                        <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                                            <span>{tr('قيمة استئجار الفستان (لفترة المناسبة)', 'Dress Rental Fee (Event Window)')}</span>
                                            <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{formatCurrency(rentalSubtotal.toFixed(2), currency)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                                            <span>{tr('التجهيز والكي والتعقيم الفاخر', 'Mandatory Cleaning & Prep')}</span>
                                            <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{formatCurrency(cleaningFeeNum.toFixed(2), currency)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                                            <span>{tr('مبلغ التأمين المسترد (25% مسترد بالكامل)', 'Refundable Security Deposit (25%)')}</span>
                                            <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(securityDepositNum.toFixed(2), currency)}</span>
                                        </div>

                                        <div className="my-3 h-px bg-stone-200 dark:bg-stone-800" />

                                        {/* 10% Online Reservation Fee & 90% Offline Split */}
                                        <div className="space-y-2.5">
                                            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-xs text-amber-900 dark:text-amber-200">
                                                        {tr('المطلوب دفعه أونلاين الآن (عربون وضمان الحجز 10%):', 'Pay Online Now (10% Reservation Fee):')}
                                                    </p>
                                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                                                        {tr('يضمن حجز الفستان لكِ فورياً ويمنع حجزه لعميلة أخرى', 'Instantly locks gown availability and dates')}
                                                    </p>
                                                </div>
                                                <span className="font-serif font-bold text-base text-amber-900 dark:text-amber-100 font-mono">
                                                    {formatCurrency(onlineReservationFee.toFixed(2), currency)}
                                                </span>
                                            </div>

                                            <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-xs text-stone-800 dark:text-stone-200">
                                                        {tr('المتبقي يُدفع بالأتيليه عند الاستلام:', 'Remaining Balance Due at Atelier:')}
                                                    </p>
                                                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                                                        {tr('90% من قيمة الإيجار + مبلغ التأمين المسترد (25%)', '90% rental balance + refundable 25% deposit')}
                                                    </p>
                                                </div>
                                                <span className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 font-mono">
                                                    {formatCurrency(totalDueAtAtelier.toFixed(2), currency)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                                            {tr('مبلغ التأمين مسترد بالكامل فور تسليم الفستان للأتيليه بحالته السليمة.', 'Security deposit is refunded in full upon gown return in good condition.')}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                                            <span>{tr('سعر شراء الفستان نهائياً', 'Dress Purchase Price')}</span>
                                            <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{formatCurrency(purchasePriceNum.toFixed(2), currency)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                                            <span>{tr('تغليف فاخر وشحن مخصص', 'Luxury Packaging & Dispatch')}</span>
                                            <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{formatCurrency(cleaningFeeNum.toFixed(2), currency)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                                            <span>{tr('ضريبة القيمة المضافة (14%)', 'Taxes & Fees (14%)')}</span>
                                            <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{formatCurrency(purchaseTax.toFixed(2), currency)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                                            <span>{tr('مبلغ التأمين', 'Security Deposit')}</span>
                                            <span className="font-mono font-medium text-stone-400">0.00 {currency} ({tr('لا يوجد تأمين', 'No deposit')})</span>
                                        </div>

                                        <div className="my-3 h-px bg-stone-200 dark:bg-stone-800" />

                                        <div className="flex justify-between items-baseline pt-1">
                                            <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{tr('إجمالي قيمة الشراء', 'Total Purchase Amount')}</span>
                                            <span className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100 font-mono">
                                                {formatCurrency(purchaseTotal.toFixed(2), currency)}
                                            </span>
                                        </div>

                                        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                                            {tr('طلب شراء وتملك دائم — الفستان يصبح ملكاً لكِ بالكامل ولا يتطلب أي إرجاع.', 'Permanent ownership — the dress is fully yours and does not require return.')}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-4 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2.5">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                    {tr(
                                        'بالنقر على تأكيد الحجز، أنتِ توافقين على ',
                                        'By completing this booking, you agree to the '
                                    )}
                                    <a href="/terms" target="_blank" rel="noreferrer" className="text-rose-600 dark:text-rose-400 underline font-semibold">
                                        {tr('شروط الاستخدام وضمان استرداد التأمين (خلال 24 ساعة)', 'Terms of Service & Deposit Return Guarantee (within 24h)')}
                                    </a>
                                    {tr(' و ', ' and ')}
                                    <a href="/privacy" target="_blank" rel="noreferrer" className="text-rose-600 dark:text-rose-400 underline font-semibold">
                                        {tr('سياسة الخصوصية', 'Privacy Policy')}
                                    </a>.
                                </p>
                            </div>
                        </div>

                        {form.hasErrors ? (
                            <Alert tone="danger" title={tr('يرجى تصحيح الحقول المحددة.', 'Please correct highlighted fields.')}>
                                {Object.values(form.errors).join(' ')}
                            </Alert>
                        ) : null}
                    </section>
                ) : null}

                {/* STEP 3: Order Confirmation */}
                {step === 3 ? (
                    <section
                        aria-label="Order placed"
                        className="flex max-w-xl flex-col items-start gap-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-xs"
                    >
                        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                            {orderMode === 'buy'
                                ? tr('تم تسجيل طلب الشراء بنجاح — جاهز للدفع', 'Purchase Order Created — Complete Payment')
                                : tr('تم تأكيد حجز الإيجار بنجاح — جاهز للدفع', 'Booking Created — Complete Payment')}
                        </h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            {orderMode === 'buy'
                                ? tr('تم حجز الفستان لشرائه، يرجى الانتقال لبوابة الدفع الإلكتروني لتأكيد العملية والبدء في الشحن.', 'Your dress purchase is registered. Proceed to payment to complete order.')
                                : tr('تم حجز الفستان في المواعيد المحددة، يرجى إتمام الدفع الإلكتروني لتأكيد التعاقد واستلام الفستان.', 'Your rental is reserved. Proceed to payment to confirm and receive your gown.')}
                        </p>
                        <Alert tone="info" title={tr('الخطوة التالية', 'Next Step')}>
                            {tr('سيتم توجيهك لصفحة الدفع الآمن لسداد القيمة وإصدار الفاتورة الإلكترونية المعتمدة.', 'You will now be redirected to the secure payment portal.')}
                        </Alert>
                    </section>
                ) : null}

                {/* Navigation Buttons */}
                {step < 3 ? (
                    <div className="mt-8 flex items-center justify-between border-t border-stone-200 dark:border-stone-800 pt-6">
                        {step > 0 ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep((current) => current - 1)}
                                disabled={form.processing}
                                className="text-xs text-stone-700 dark:text-stone-300"
                            >
                                {tr('← الرجوع للخطوة السابقة', '← Back')}
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
                                className="text-xs font-bold"
                            >
                                {form.processing
                                    ? tr('جاري إنشاء الطلب…', 'Placing order…')
                                    : orderMode === 'buy'
                                      ? tr('تأكيد الشراء والمتابعة للدفع', 'Confirm Purchase & Pay')
                                      : tr('تأكيد الحجز والمتابعة للدفع', 'Confirm Booking & Pay')}
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleContinue} disabled={form.processing} className="text-xs">
                                {tr('متابعة الخطوة التالية →', 'Continue →')}
                            </Button>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}