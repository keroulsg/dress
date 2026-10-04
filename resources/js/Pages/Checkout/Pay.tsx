import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import { SecureCheckoutForm } from '../../Modules/Payment';
import { useLanguage } from '../../Contexts/LanguageContext';
import { ShieldCheck, Calendar, Store, ArrowRight, ArrowLeft, Lock, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../Lib/utils';

interface PayProps {
    booking: {
        id: number;
        booking_reference: string;
        status: string;
        start_date: string | null;
        end_date: string | null;
        currency: string;
        rental_rate_total: string;
        cleaning_fee_total: string;
        security_deposit_amount: string;
        grand_total: string;
        total_booking_value: string;
        upfront_reservation_fee: string;
        offline_settlement_balance: string;
        dress: {
            id: number;
            title: string;
            image_url?: string | null;
        } | null;
        atelier: {
            id: number;
            business_name: string;
            city?: string;
        } | null;
    };
}

export default function Pay({ booking }: PayProps) {
    const { tr, isRtl } = useLanguage();

    return (
        <StorefrontLayout>
            <Head title={`${tr('دفع عربون الحجز (10%)', 'Pay 10% Reservation Fee')} | #${booking.booking_reference}`} />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 lg:px-8">
                {/* Back to booking link */}
                <div className="mb-6">
                    <Link
                        href={`/account/bookings/${booking.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
                    >
                        {isRtl ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                        <span>{tr('العودة إلى تفاصيل الحجز', 'Back to Booking Contract')}</span>
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{tr('تأكيد الحجز والدفع الآمن', 'Secure Reservation Confirmation')}</span>
                    </div>
                    <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                        {tr('سداد عربون الحجز الإلكتروني (10%)', 'Pay 10% Online Reservation Fee')}
                    </h1>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                        {tr(
                            `مرجع الحجز: #${booking.booking_reference} · سداد العربون يؤكد حجز الفستان ويفك حجب عنوان الأتيليه والتواصل فوراً.`,
                            `Booking Ref: #${booking.booking_reference} · Paying the fee locks the gown schedule and unlocks full studio address immediately.`
                        )}
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12 items-start">
                    {/* Left 7 Cols: Payment Form & Guarantees */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 10% Policy Note */}
                        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 sm:p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="space-y-1 text-xs">
                                    <p className="font-bold text-amber-900 dark:text-amber-300">
                                        {tr('نظام السداد المقسم المعتمد (10% أونلاين + 90% بالأوفلاين)', '10% Online Fee + 90% In-Store Settlement')}
                                    </p>
                                    <p className="text-amber-800/90 dark:text-amber-400/90 leading-relaxed">
                                        {tr(
                                            `أنت تدفع الآن فقط مبلغ (${booking.upfront_reservation_fee} ${booking.currency}) كعربون حجز وضمان للقطعة عبر المنصة. باقي المبلغ (${booking.offline_settlement_balance} ${booking.currency}) ومبلغ التأمين المسترد يسدد عند الاستلام والبروفة في الأتيليه.`,
                                            `You are charged only (${booking.upfront_reservation_fee} ${booking.currency}) right now online. The remaining balance (${booking.offline_settlement_balance} ${booking.currency}) + refundable deposit is paid upon pickup & fitting at the atelier.`
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Secure Checkout Form */}
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-6 shadow-xs">
                            <SecureCheckoutForm
                                bookingId={booking.id}
                                onSuccess={() => {
                                    window.location.href = `/account/bookings/${booking.id}`;
                                }}
                            />
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center gap-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-3 text-xs text-stone-600 dark:text-stone-300">
                                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>{tr('مدفوعات مشفرة وآمنة 100%', '100% Encrypted & Secure')}</span>
                            </div>
                            <div className="flex items-center gap-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-3 text-xs text-stone-600 dark:text-stone-300">
                                <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                                <span>{tr('تأكيد لحظي وتأمين الحجز', 'Instant Booking Confirmation')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right 5 Cols: Booking & Financial Breakdown */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-5">
                            {/* Dress Card */}
                            {booking.dress && (
                                <div className="flex items-center gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                                    {booking.dress.image_url ? (
                                        <img
                                            src={booking.dress.image_url}
                                            alt={booking.dress.title}
                                            className="h-16 w-16 rounded-xl object-cover border border-stone-200 dark:border-stone-800 shrink-0"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 shrink-0">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                                            {booking.dress.title}
                                        </h3>
                                        {booking.atelier && (
                                            <p className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                                                <Store className="h-3.5 w-3.5 text-amber-600" />
                                                <span>{booking.atelier.business_name}</span>
                                                {booking.atelier.city && <span>· {booking.atelier.city}</span>}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Booking Dates */}
                            {booking.start_date && (
                                <div className="flex items-center justify-between rounded-xl bg-stone-50 dark:bg-stone-800/50 p-3 text-xs">
                                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                                        <Calendar className="h-4 w-4 text-amber-600" />
                                        <span>{tr('فترة الإيجار المحددة:', 'Rental Period:')}</span>
                                    </div>
                                    <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                                        {booking.start_date} ← {booking.end_date}
                                    </span>
                                </div>
                            )}

                            {/* Pricing Breakdown */}
                            <div className="space-y-3 pt-2 text-xs">
                                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                                    <span>{tr('قيمة الإيجار الأساسية', 'Base Rental Rate')}</span>
                                    <span className="font-mono font-medium text-stone-900 dark:text-stone-100">
                                        {booking.rental_rate_total} {booking.currency}
                                    </span>
                                </div>

                                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                                    <span>{tr('رسوم التعقيم والتنظيف', 'Dry Cleaning & Prep')}</span>
                                    <span className="font-mono font-medium text-stone-900 dark:text-stone-100">
                                        {booking.cleaning_fee_total} {booking.currency}
                                    </span>
                                </div>

                                <div className="flex justify-between text-stone-500 dark:text-stone-400 text-[11px]">
                                    <span>{tr('مبلغ التأمين (مسترد بالكامل عند الإرجاع)', 'Security Deposit (Refundable)')}</span>
                                    <span className="font-mono font-medium text-stone-700 dark:text-stone-300">
                                        {booking.security_deposit_amount} {booking.currency}
                                    </span>
                                </div>

                                <div className="my-2 border-t border-dashed border-stone-200 dark:border-stone-800" />

                                {/* Upfront Online Fee Highlight */}
                                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 space-y-1">
                                    <div className="flex justify-between items-center text-amber-900 dark:text-amber-200">
                                        <span className="font-bold text-xs">{tr('عربون الحجز المطلوب دفعه الآن (10%):', 'Payable Now (10% Online Fee):')}</span>
                                        <span className="font-mono text-base font-bold text-amber-700 dark:text-amber-400">
                                            {booking.upfront_reservation_fee} {booking.currency}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                                        {tr('يتم خصمه إلكترونياً لتأكيد الحجز وحجز الموعد فوراً', 'Charged electronically to confirm and lock your booking slot')}
                                    </p>
                                </div>

                                {/* Remaining Balance Upon Pickup */}
                                <div className="rounded-xl bg-stone-50 dark:bg-stone-800/40 p-3 space-y-1">
                                    <div className="flex justify-between items-center text-stone-700 dark:text-stone-300 text-xs">
                                        <span className="font-medium">{tr('المتبقي للتسوية في الأتيليه (90% + التأمين):', 'Settled In-Store (90% + Deposit):')}</span>
                                        <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                                            {booking.offline_settlement_balance} {booking.currency}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-stone-400 dark:text-stone-500">
                                        {tr('يسدد نقداً أو بالبطاقة عند زيارة الأتيليه والبروفة', 'Paid in cash/card during your studio visit & final fitting')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
