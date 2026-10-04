import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import type { PageProps } from '@/types';

import { BookingTimeline } from '@/Modules/Booking';
import { formatCurrency } from '@/Lib/currency';
import { Button } from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { Modal, ModalContent, ModalTitle } from '@/Components/UI/Modal';
import { Textarea } from '@/Components/UI/Textarea';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import {
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    Lock,
    MapPin,
    MessageCircle,
    Phone,
    QrCode,
    Receipt,
    ShieldCheck,
    Store,
    Wallet,
} from 'lucide-react';
import { cn } from '@/Lib/utils';

type BookingsShowProps = PageProps<{
    booking: {
        id: number;
        booking_reference: string;
        status: string;
        fitting_datetime: string | null;
        start_date: string | null;
        end_date: string | null;
        deposit_refunded_at?: string | null;
        deposit_acknowledged_at?: string | null;
        deposit_disputed?: boolean;
        grand_total: string;
        currency: string;
        rental_rate_total: string;
        cleaning_fee_total: string;
        security_deposit_amount: string;
        tax_amount?: string | null;
        atelier?: {
            id: number;
            business_name: string;
            city: string;
            address: string | null;
            phone: string | null;
            whatsapp: string | null;
            email: string | null;
            maps_url: string | null;
            is_details_revealed: boolean;
        } | null;
        items: Array<{
            dress_title: string | null;
            quantity: number;
            unit_rental_price: string;
            rental_days: number;
            subtotal: string;
        }>;
    };
}>;

const CANCELLABLE = ['pending_payment', 'confirmed', 'fitting_scheduled', 'ready_for_dispatch'];

export default function BookingsShow({ booking }: BookingsShowProps) {
    const { t, tr, isRtl } = useLanguage();
    const [cancelOpen, setCancelOpen] = useState(false);
    const [isAcknowledging, setIsAcknowledging] = useState(false);
    const cancelForm = useForm({ reason: '' });

    const handleAcknowledgeDeposit = () => {
        setIsAcknowledging(true);
        router.post(`/account/bookings/${booking.id}/acknowledge-deposit`, {}, {
            preserveScroll: true,
            onFinish: () => setIsAcknowledging(false),
        });
    };

    const submitCancel = (): void => {
        cancelForm.post(`/account/bookings/${booking.id}/cancel`, {
            onSuccess: () => setCancelOpen(false),
        });
    };

    const isPaid = booking.status !== 'pending_payment';
    const isCancelled = booking.status === 'cancelled';
    const atelier = booking.atelier;

    const rentalNum = parseFloat(booking.rental_rate_total || '0');
    const cleaningNum = parseFloat(booking.cleaning_fee_total || '0');
    const depositNum = parseFloat(booking.security_deposit_amount || '0');
    const totalBookingValue = rentalNum + cleaningNum;
    const upfrontReservationFee = totalBookingValue * 0.10;
    const offlineSettlementBalance = (totalBookingValue * 0.90) + depositNum;

    return (
        <CustomerLayout>
            <Head title={`${tr('تفاصيل الحجز', 'Booking Details')} #${booking.booking_reference}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                #{booking.booking_reference}
                            </span>
                            <Badge tone={isPaid ? 'success' : isCancelled ? 'danger' : 'warning'}>
                                {t(`status.${booking.status}`, booking.status)}
                            </Badge>
                        </div>
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                            {tr('تفاصيل عقد الحجز والتأجير', 'Booking & Rental Contract')}
                        </h1>
                    </div>

                    {!isPaid && !isCancelled && (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="champagne" size="sm" className="text-xs font-semibold shadow-xs">
                                <Link href={`/checkout/${booking.id}/pay`}>
                                    <Wallet className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} />
                                    {tr('دفع عربون الحجز (10% أونلاين)', 'Pay 10% Reservation Online')}
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-8 lg:grid-cols-5 items-start">
                    {/* Left Column: Timeline & Atelier Contact */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Deposit Fully Acknowledged Receipt */}
                        {booking.deposit_acknowledged_at && (
                            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 shadow-xs flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                                            {tr('إيصال استرداد التأمين موثق رسمياً ✓', 'Security Deposit Refund Acknowledged ✓')}
                                        </h4>
                                        <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                            {formatCurrency(booking.security_deposit_amount, booking.currency)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                                        {tr(
                                            'أقررتِ رسمياً باستلام كامل مبلغ التأمين النقدي من المتجر، وتم إغلاق دورة الحجز وتأمين العملية بنجاح.',
                                            'You have officially acknowledged receipt of the full security deposit. The contract cycle is safely completed.'
                                        )}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400">
                                        <span>
                                            {tr('تاريخ توثيق العميلة:', 'Acknowledged:')}{' '}
                                            <span className="font-mono">{new Date(booking.deposit_acknowledged_at).toLocaleDateString()}</span>
                                        </span>
                                        {booking.deposit_refunded_at && (
                                            <span>
                                                {tr('تاريخ رد المتجر:', 'Refunded by Atelier:')}{' '}
                                                <span className="font-mono">{new Date(booking.deposit_refunded_at).toLocaleDateString()}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Deposit Acknowledgment Pending Action */}
                        {booking.deposit_refunded_at && !booking.deposit_acknowledged_at && (
                            <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/40 p-5 shadow-md space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                                        <Receipt className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                                                {tr('سجل المتجر إعادة مبلغ التأمين كاملاً', 'Atelier Recorded Full Deposit Refund')}
                                            </h4>
                                            <span className="font-mono font-bold text-sm text-amber-900 dark:text-amber-200">
                                                {formatCurrency(booking.security_deposit_amount, booking.currency)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                            {tr(
                                                'قام الأتيليه بتأكيد رد مبلغ التأمين إليكِ نقداً أو تحويلاً. لإغلاق دورة الحجز وتأكيد حقوق الطرفين، يرجى الضغط على زر الإقرار أدناه فور استلام المبلغ كاملاً.',
                                                'The atelier reported that your security deposit has been fully returned. Please acknowledge receipt to complete the contract verification.'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-amber-200 dark:border-amber-900/50">
                                    <div className="text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                        <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
                                        <span>{tr('إجراء إلزامي لتوثيق دورة المعاملة الثنائية', 'Mandatory two-way contract closure')}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="champagne"
                                        size="sm"
                                        onClick={handleAcknowledgeDeposit}
                                        disabled={isAcknowledging}
                                        className="w-full sm:w-auto font-bold text-xs shadow-sm"
                                    >
                                        <CheckCircle2 className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} />
                                        {isAcknowledging ? tr('جاري التوثيق…', 'Confirming…') : tr('أقر باستلام مبلغ التأمين كاملاً', 'I Acknowledge Receipt of Full Deposit')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs">
                            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">
                                {tr('مراحل الحجز والتسليم', 'Booking Lifecycle Timeline')}
                            </h3>
                            <BookingTimeline
                                status={booking.status}
                                startDate={booking.start_date ?? ''}
                                endDate={booking.end_date ?? ''}
                                fittingDatetime={booking.fitting_datetime ?? undefined}
                                actions={
                                    CANCELLABLE.includes(booking.status)
                                        ? [{ label: tr('إلغاء الحجز', 'Cancel Booking'), tone: 'danger', onClick: () => setCancelOpen(true) }]
                                        : []
                                }
                            />
                        </div>

                        {/* Atelier Details Card: Conditioned Post-Payment Reveal */}
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Store className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                                        {tr('بيانات دار الأزياء / الأتيليه المستضيف', 'Host Fashion House & Studio')}
                                    </h3>
                                </div>
                                <span className="text-xs font-mono text-stone-400">
                                    {atelier?.business_name ?? 'Maison Atelier'}
                                </span>
                            </div>

                            {atelier?.is_details_revealed ? (
                                /* Confirmed/Paid state: Fully revealed Atelier details */
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3">
                                        <ShieldCheck className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                                        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                                            <p className="font-bold">{tr('الحجز مؤكد وموثق بالكامل!', 'Booking Confirmed & Verified!')}</p>
                                            <p className="text-[11px] mt-0.5">
                                                {tr(
                                                    'يمكنكِ الآن التوجه للأتيليه أو التواصل معهم مباشرة بالهاتف أو الواتساب لتنسيق الاستلام والبروفة.',
                                                    'You may now contact the atelier directly or visit for fitting and pickup.'
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                            <span className="text-[10px] text-stone-500 uppercase font-semibold block mb-1">
                                                {tr('العنوان التفصيلي', 'Studio Address')}
                                            </span>
                                            <p className="font-semibold text-stone-900 dark:text-stone-100">
                                                {atelier.address || atelier.city}
                                            </p>
                                            {atelier.maps_url && (
                                                <a
                                                    href={atelier.maps_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline mt-2"
                                                >
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    <span>{tr('فتح في خرائط جوجل', 'Open in Google Maps')}</span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2.5">
                                            <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                                                {tr('أرقام التواصل والتنسيق (واتساب وهاتف)', 'Direct Contact & WhatsApp')}
                                            </span>
                                            <div className="flex flex-col gap-2">
                                                {atelier.phone && (
                                                    <a
                                                        href={`tel:${atelier.phone}`}
                                                        className="inline-flex items-center gap-2 font-mono font-bold text-xs text-stone-900 dark:text-stone-100 hover:text-amber-600"
                                                    >
                                                        <Phone className="h-3.5 w-3.5 text-stone-400" />
                                                        <span>{atelier.phone}</span>
                                                    </a>
                                                )}
                                                {(atelier.whatsapp || atelier.phone) && (
                                                    <a
                                                        href={`https://wa.me/${(atelier.whatsapp || atelier.phone || '').replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span>{tr('تواصل مباشر عبر واتساب', 'Chat on WhatsApp')}</span>
                                                    </a>
                                                )}
                                                {!atelier.phone && !atelier.whatsapp && (
                                                    <p className="text-stone-400 text-xs">—</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* In-Atelier QR Pass */}
                                    <div className="p-4 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                                                <QrCode className="h-4 w-4" />
                                                <span>{tr('بطاقة التحقق والاستلام (Pickup Pass)', 'In-Atelier Pickup Pass')}</span>
                                            </div>
                                            <p className="text-[11px] text-stone-600 dark:text-stone-400">
                                                {tr('أظهري هذا الكود لصاحبة الأتيليه عند الحضور لتسجيل استلام الفستان فورياً.', 'Show this pass code to the atelier staff upon arrival to receive your dress.')}
                                            </p>
                                            <p className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100 mt-1">
                                                PASS-{booking.booking_reference}
                                            </p>
                                        </div>
                                        <div className="h-16 w-16 bg-white dark:bg-stone-800 rounded-lg p-1.5 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0 shadow-xs">
                                            <QrCode className="h-12 w-12 text-stone-900 dark:text-stone-100" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Pending payment state: Masked details */
                                <div className="p-5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3 text-center">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                                            {tr('🔒 تفاصيل العنوان ورقم الهاتف محجوبة مؤقتاً', '🔒 Studio Address & Phone Number Hidden')}
                                        </h4>
                                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
                                            {tr(
                                                `الأتيليه متواجد في منطقة (${atelier?.city ?? 'القاهرة'}). يتم إظهار العنوان التفصيلي، اللوكيشن، ورقم التواصل فور دفع عربون الحجز (10%).`,
                                                `Located in (${atelier?.city ?? 'Cairo'}). Exact street address, GPS location, and direct phone are unlocked upon paying the 10% reservation fee.`
                                            )}
                                        </p>
                                    </div>

                                    {!isCancelled && (
                                        <div className="pt-2">
                                            <Button asChild variant="champagne" size="sm" className="text-xs font-semibold">
                                                <Link href={`/checkout/${booking.id}/pay`}>
                                                    {tr('دفع عربون الحجز وتأكيد العنوان الآن', 'Pay 10% Online & Unlock Address')}
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Pricing & Split Balance Breakdown */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4">
                            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">
                                {tr('تفاصيل الحساب والرسوم', 'Pricing & Split Summary')}
                            </h3>

                            {booking.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2 text-xs">
                                    <span className="font-bold text-stone-900 dark:text-stone-100">{item.dress_title ?? 'Haute Couture Dress'}</span>
                                    <span className="font-mono text-stone-500">
                                        {item.rental_days} {tr('أيام', 'days')}
                                    </span>
                                </div>
                            ))}

                            <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                                <div className="flex justify-between">
                                    <span>{tr('قيمة الإيجار', 'Rental Rate')}</span>
                                    <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{formatCurrency(booking.rental_rate_total, booking.currency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{tr('رسوم التجهيز والتعقيم', 'Cleaning & Prep')}</span>
                                    <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{formatCurrency(booking.cleaning_fee_total, booking.currency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{tr('مبلغ التأمين المسترد', 'Refundable Deposit')}</span>
                                    <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(booking.security_deposit_amount, booking.currency)}</span>
                                </div>
                                {Number(booking.tax_amount || 0) > 0 && (
                                    <div className="flex justify-between">
                                        <span>{tr('ضريبة القيمة المضافة (VAT)', 'Value Added Tax (VAT)')}</span>
                                        <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{formatCurrency(booking.tax_amount || '0.00', booking.currency)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="my-3 h-px bg-stone-200 dark:bg-stone-800" />

                            {/* 10% / 90% Split Breakdown */}
                            <div className="space-y-2.5">
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-bold text-amber-900 dark:text-amber-200">
                                            {tr('عربون الحجز الأونلاين (10%):', 'Online Reservation Fee (10%):')}
                                        </p>
                                        <p className="text-[10px] text-amber-700 dark:text-amber-400">
                                            {isPaid ? tr('تم السداد بنجاح ✓', 'Paid Online ✓') : tr('مطلوب للدفع أونلاين', 'Due Online')}
                                        </p>
                                    </div>
                                    <span className="font-mono font-bold text-sm text-amber-900 dark:text-amber-100">
                                        {formatCurrency(upfrontReservationFee.toFixed(2), booking.currency)}
                                    </span>
                                </div>

                                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-bold text-stone-800 dark:text-stone-200">
                                            {tr('المتبقي نقداً عند الاستلام:', 'Balance at Pickup / Fitting:')}
                                        </p>
                                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                                            {tr('90% + التأمين المسترد', '90% + Refundable Deposit')}
                                        </p>
                                    </div>
                                    <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                                        {formatCurrency(offlineSettlementBalance.toFixed(2), booking.currency)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-between items-baseline border-t border-stone-100 dark:border-stone-800">
                                <span className="font-bold text-xs text-stone-900 dark:text-stone-100">{tr('إجمالي قيمة العقد كاملة', 'Total Contract Value')}</span>
                                <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 font-mono">
                                    {formatCurrency(booking.grand_total, booking.currency)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Booking Modal */}
            <Modal open={cancelOpen} onOpenChange={setCancelOpen}>
                <ModalContent className="max-w-md bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xl">
                    <ModalTitle className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                        {tr('إلغاء الحجز', 'Cancel Booking')}
                    </ModalTitle>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                        {tr('إلغاء الحجز يحرر التواريخ فورياً في الكتالوج. يرجى ذكر سبب الإلغاء.', 'Cancelling releases reserved dates immediately. Please state reason.')}
                    </p>
                    <form onSubmit={(e) => { e.preventDefault(); submitCancel(); }} className="mt-4 space-y-3">
                        <Textarea
                            value={cancelForm.data.reason}
                            onChange={(event) => cancelForm.setData('reason', event.target.value)}
                            placeholder={tr('سبب الإلغاء...', 'Cancellation reason...')}
                            className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 rounded-xl"
                            rows={3}
                            required
                        />
                        {cancelForm.errors.reason && (
                            <p className="text-xs text-rose-600">{cancelForm.errors.reason}</p>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setCancelOpen(false)} className="text-xs">
                                {tr('تراجع', 'Keep Booking')}
                            </Button>
                            <Button type="submit" variant="danger" size="sm" disabled={cancelForm.processing || !cancelForm.data.reason.trim()} className="text-xs font-semibold">
                                {cancelForm.processing ? tr('جاري الإلغاء…', 'Cancelling…') : tr('تأكيد الإلغاء', 'Confirm Cancel')}
                            </Button>
                        </div>
                    </form>
                </ModalContent>
            </Modal>
        </CustomerLayout>
    );
}