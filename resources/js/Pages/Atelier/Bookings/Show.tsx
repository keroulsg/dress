import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import type { PageProps } from '@/types';
import AtelierLayout from '@/Layouts/AtelierLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { formatCurrency } from '@/Lib/currency';
import { formatDateRange } from '@/Lib/dates';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Modal, ModalContent, ModalTitle } from '@/Components/UI/Modal';
import { Select } from '@/Components/UI/Select';
import { Textarea } from '@/Components/UI/Textarea';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    CreditCard,
    Download,
    FileCheck2,
    FileText,
    IdCard,
    MapPin,
    Package,
    Phone,
    Send,
    ShieldAlert,
    ShieldCheck,
    User,
    ZoomIn,
} from 'lucide-react';
import { cn } from '@/Lib/utils';

interface AtelierBookingShowProps extends PageProps {
    atelier: { id: number; business_name: string };
    booking: {
        id: number;
        booking_reference: string;
        status: string;
        start_date: string | null;
        end_date: string | null;
        grand_total: string;
        currency: string;
        rental_rate_total: string;
        cleaning_fee_total: string;
        security_deposit_amount: string;
        delivery_address: string | null;
        order_type?: string;
        returned_at?: string | null;
        deposit_disputed?: boolean;
        deposit_refunded_at?: string | null;
        renter: {
            id: number;
            name: string;
            phone: string | null;
            email: string | null;
            has_kyc: boolean;
            kyc_status: string;
            front_doc_url: string | null;
            back_doc_url: string | null;
        };
        items: Array<{
            dress_title: string | null;
            quantity: number;
            unit_rental_price: string;
            rental_days: number;
            subtotal: string;
        }>;
    };
    statuses: string[];
}

const NEXT_STATES: Record<string, string> = {
    pending_payment: 'confirmed',
    confirmed: 'ready_for_dispatch',
    ready_for_dispatch: 'dispatched',
    dispatched: 'in_customer_possession',
    in_customer_possession: 'returned_pending_inspection',
    returned_pending_inspection: 'inspection_completed',
};

export default function AtelierBookingShow({ atelier, booking, statuses }: AtelierBookingShowProps) {
    const { t, tr, isRtl } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

    const transitionForm = useForm({
        target_status: '',
        reason: '',
    });

    const refundForm = useForm({});
    const claimForm = useForm({
        damage_description: '',
        repair_cost: '',
    });

    const submitClaim = (e: React.FormEvent) => {
        e.preventDefault();
        claimForm.post(`/atelier/${atelier.id}/bookings/${booking.id}/damage-claim`, {
            onSuccess: () => setIsClaimModalOpen(false),
        });
    };

    const submitTransition = (e: React.FormEvent) => {
        e.preventDefault();
        transitionForm.post(`/atelier/${atelier.id}/bookings/${booking.id}/transition`, {
            preserveScroll: true,
        });
    };

    const rentalNum = parseFloat(booking.rental_rate_total || '0');
    const cleaningNum = parseFloat(booking.cleaning_fee_total || '0');
    const depositNum = parseFloat(booking.security_deposit_amount || '0');
    const totalBookingValue = rentalNum + cleaningNum;
    const upfrontReservationFee = totalBookingValue * 0.10;
    const offlineSettlementBalance = (totalBookingValue * 0.90) + depositNum;

    return (
        <AtelierLayout
            title={`${tr('حجز رقم', 'Booking')} #${booking.booking_reference}`}
            breadcrumbs={[
                { label: t('atelier.nav.bookings'), href: `/atelier/${atelier.id}/bookings` },
                { label: `#${booking.booking_reference}` },
            ]}
        >
            <Head title={`#${booking.booking_reference} | ${atelier.business_name}`} />

            <div className="space-y-6">
                {/* Header with quick back */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/atelier/${atelier.id}/bookings`}
                            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        >
                            <ArrowLeft className={cn("h-4 w-4 text-stone-600 dark:text-stone-300", isRtl && "rotate-180")} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                                    #{booking.booking_reference}
                                </span>
                                <Badge tone={booking.status === 'confirmed' || booking.status === 'in_customer_possession' ? 'success' : 'warning'}>
                                    {t(`status.${booking.status}`, booking.status)}
                                </Badge>
                            </div>
                            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                                {booking.items[0]?.dress_title ?? tr('طلب حجز فستان', 'Dress Booking Order')}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="text-xs">
                            <Link href={`/atelier/${atelier.id}/bookings`}>
                                {tr('العودة لقائمة الحجوزات', 'Back to Bookings')}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left 2 Cols: Identity & KYC Documents Verification */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Renter Identity & National ID Handover Card */}
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <IdCard className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                                        {tr('بيانات المستأجرة والتحقق من الهوية (KYC)', 'Client Identity & National ID Verification')}
                                    </h3>
                                </div>
                                {booking.renter.has_kyc ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        {tr('الهوية مرفوعة ومتاحة للفحص', 'ID Uploaded & Available')}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
                                        <ShieldAlert className="h-3.5 w-3.5" />
                                        {tr('لم ترفع صورة البطاقة بعد', 'No ID Uploaded Yet')}
                                    </span>
                                )}
                            </div>

                            {/* Client Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                    <span className="text-[10px] text-stone-500 uppercase font-semibold block mb-1">
                                        {tr('اسم المستأجرة', 'Renter Name')}
                                    </span>
                                    <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                                        {booking.renter.name}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                    <span className="text-[10px] text-stone-500 uppercase font-semibold block mb-1">
                                        {tr('رقم الهاتف للتواصل', 'Phone Number')}
                                    </span>
                                    <p className="font-mono font-semibold text-stone-900 dark:text-stone-100 text-sm">
                                        {booking.renter.phone || '—'}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                    <span className="text-[10px] text-stone-500 uppercase font-semibold block mb-1">
                                        {tr('البريد الإلكتروني', 'Email')}
                                    </span>
                                    <p className="font-mono text-stone-900 dark:text-stone-100 truncate">
                                        {booking.renter.email || '—'}
                                    </p>
                                </div>
                            </div>

                            {/* National ID Document Viewer */}
                            {booking.renter.front_doc_url ? (
                                <div className="space-y-3 pt-2">
                                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                                        <FileCheck2 className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">
                                                {tr('التحقق من الهوية عند تسليم الفستان (Handover Verification):', 'Handover Identity Verification:')}
                                            </p>
                                            <p className="text-[11px] mt-0.5">
                                                {tr(
                                                    'طابقي بيانات المستأجرة وبطاقتها القومية مع الصور المرفوعة أدناه قبل تسليم الفستان، لاسترداد مبلغ التأمين بأمان عند الإرجاع.',
                                                    'Verify client physical National ID against uploaded scans before handing over the dress.'
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Front ID */}
                                        <div className="rounded-xl border border-stone-200 dark:border-stone-700 p-3 bg-stone-50 dark:bg-stone-800/40 space-y-2">
                                            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                                                {tr('بطاقة الرقم القومي (الوجه الأمامي)', 'National ID (Front Side)')}
                                            </span>
                                            <div className="relative group aspect-[16/10] rounded-lg overflow-hidden border border-stone-300 dark:border-stone-600 bg-black/5 dark:bg-black/40 flex items-center justify-center">
                                                <img
                                                    src={booking.renter.front_doc_url}
                                                    alt="National ID Front"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                                <a
                                                    href={booking.renter.front_doc_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity"
                                                >
                                                    <ZoomIn className="h-4 w-4" />
                                                    {tr('عرض بالحجم الكامل', 'View Fullscreen')}
                                                </a>
                                            </div>
                                            <div className="pt-1 flex items-center justify-between">
                                                <span className="text-[11px] text-stone-500 font-medium">
                                                    {tr('الوجه الأمامي للبطاقة', 'Front Scan')}
                                                </span>
                                                <a
                                                    href={`${booking.renter.front_doc_url}${booking.renter.front_doc_url.includes('?') ? '&' : '?'}download=1`}
                                                    download
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    <span>{tr('تنزيل على جهازي', 'Download ID')}</span>
                                                </a>
                                            </div>
                                        </div>

                                        {/* Back ID */}
                                        {booking.renter.back_doc_url ? (
                                            <div className="rounded-xl border border-stone-200 dark:border-stone-700 p-3 bg-stone-50 dark:bg-stone-800/40 space-y-2">
                                                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                                                    {tr('بطاقة الرقم القومي (الوجه الخلفي)', 'National ID (Back Side)')}
                                                </span>
                                                <div className="relative group aspect-[16/10] rounded-lg overflow-hidden border border-stone-300 dark:border-stone-600 bg-black/5 dark:bg-black/40 flex items-center justify-center">
                                                    <img
                                                        src={booking.renter.back_doc_url}
                                                        alt="National ID Back"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                    <a
                                                        href={booking.renter.back_doc_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity"
                                                    >
                                                        <ZoomIn className="h-4 w-4" />
                                                        {tr('عرض بالحجم الكامل', 'View Fullscreen')}
                                                    </a>
                                                </div>
                                                <div className="pt-1 flex items-center justify-between">
                                                    <span className="text-[11px] text-stone-500 font-medium">
                                                        {tr('الوجه الخلفي للبطاقة', 'Back Scan')}
                                                    </span>
                                                    <a
                                                        href={`${booking.renter.back_doc_url}${booking.renter.back_doc_url.includes('?') ? '&' : '?'}download=1`}
                                                        download
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        <span>{tr('تنزيل على جهازي', 'Download ID')}</span>
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-stone-300 dark:border-stone-700 p-6 flex flex-col items-center justify-center text-center text-stone-400">
                                                <IdCard className="h-8 w-8 mb-2 opacity-50" />
                                                <span className="text-xs">{tr('لم يُرفع الوجه الخلفي', 'No Back Side Uploaded')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-center text-stone-500 text-xs">
                                    <IdCard className="h-8 w-8 mx-auto mb-2 text-stone-400" />
                                    <p className="font-semibold text-stone-700 dark:text-stone-300">
                                        {tr('لم تقم المستأجرة برفع صورة الهوية بعد', 'Client has not uploaded identity document yet.')}
                                    </p>
                                    <p className="text-[11px] text-stone-400 mt-1">
                                        {tr('يجب طلب إثبات الهوية الأصلية عند حضورها للاستلام بالأوفلاين.', 'Require physical national ID presentation upon in-person pickup.')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Delivery Address & Dates */}
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4">
                            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                                {tr('تفاصيل التسليم والمدة', 'Delivery & Rental Window')}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                    <span className="text-[10px] text-stone-500 uppercase font-semibold block mb-1">
                                        {tr('فترة الإيجار', 'Rental Period')}
                                    </span>
                                    <p className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                                        {booking.start_date && booking.end_date
                                            ? formatDateRange(booking.start_date, booking.end_date)
                                            : '—'}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                    <span className="text-[10px] text-stone-500 uppercase font-semibold block mb-1">
                                        {tr('عنوان التوصيل أو الاستلام', 'Delivery Address / Notes')}
                                    </span>
                                    <p className="text-stone-900 dark:text-stone-100 leading-relaxed font-medium">
                                        {booking.delivery_address || tr('استلام مباشر من مقر الأتيليه', 'Direct Atelier Pickup')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Financial Settlement & Stage Advance */}
                    <div className="space-y-6">
                        {/* Financial Settlement Breakdown */}
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4">
                            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">
                                {tr('المحاسبة والتسوية المالية', 'Financial Settlement')}
                            </h3>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                                    <span>{tr('قيمة إيجار الفستان الأساسي', 'Base Rental Fee')}:</span>
                                    <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                                        {formatCurrency(rentalNum.toFixed(2), booking.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                                    <span>{tr('رسوم التنظيف والتعقيم الفاخر', 'Cleaning & Prep Fee')}:</span>
                                    <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                                        {formatCurrency(cleaningNum.toFixed(2), booking.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                                    <span>{tr('مبلغ التأمين المسترد (25%)', 'Refundable Security Deposit (25%)')}:</span>
                                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(depositNum.toFixed(2), booking.currency)}
                                    </span>
                                </div>

                                <div className="my-3 h-px bg-stone-200 dark:bg-stone-800" />

                                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold text-amber-900 dark:text-amber-200">
                                        <span>{tr('عربون الحجز المسدد أونلاين (10%)', 'Online Reservation Fee (10%)')}:</span>
                                        <span className="font-mono text-sm">
                                            {formatCurrency(upfrontReservationFee.toFixed(2), booking.currency)}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400">
                                        {tr('مخصوم ومحصل إلكترونياً لصالح المنصة والأتيليه', 'Captured online via Paymob')}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1">
                                    <div className="flex justify-between items-center text-xs font-bold text-stone-900 dark:text-stone-100">
                                        <span>{tr('المتبقي للتحصيل بالأتيليه (90% + التأمين)', 'Due at Atelier (90% + Deposit)')}:</span>
                                        <span className="font-mono text-sm text-amber-800 dark:text-amber-300">
                                            {formatCurrency(offlineSettlementBalance.toFixed(2), booking.currency)}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-stone-500">
                                        {tr('يتم تحصيله نقداً أو ببطاقة عند تسليم الفستان للعميلة', 'Collected in person upon handover')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 24-Hour Return Inspection & Deposit Release Protocol */}
                        {booking.status === 'returned_pending_inspection' && (
                            <div className="rounded-2xl border-2 border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-5 space-y-4 shadow-sm animate-in fade-in">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                                            {tr('فحص المرتجع ورد التأمين (مهلة الـ 24 ساعة الإلزامية)', 'Return Inspection & Deposit Release (24h Mandatory Window)')}
                                        </h4>
                                        <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                                            {tr(
                                                'تم تسجيل استلام القطعة المرتجعة. يرجى فحص سلامتها وتأكيد رد التأمين للعميلة، أو تقديم بلاغ بالأضرار لحفظ حقوقك.',
                                                'The returned item is under inspection. Confirm piece is intact to release deposit, or record photographic damage claim.'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="champagne"
                                        size="sm"
                                        onClick={() => {
                                            if (confirm(tr('هل تؤكدين سلامة القطعة التامة وإرجاع مبلغ التأمين للعميلة وإغلاق الحجز؟', 'Confirm piece is intact, refund deposit and close booking?'))) {
                                                refundForm.post(`/atelier/${atelier.id}/bookings/${booking.id}/confirm-deposit-refunded`);
                                            }
                                        }}
                                        disabled={refundForm.processing}
                                        className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                    >
                                        <CheckCircle2 className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} />
                                        {refundForm.processing ? tr('جاري الإغلاق…', 'Closing…') : tr('تأكيد سلامة القطعة ورد التأمين للعميلة ✓', 'Confirm Intact & Release Deposit ✓')}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsClaimModalOpen(true)}
                                        className="w-full text-xs text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                    >
                                        <ShieldAlert className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} />
                                        {tr('تسجيل بلاغ تلفيات وفتح نزاع تأمين', 'File Damage Claim & Open Dispute')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Transition Action Form */}
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4">
                            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">
                                {tr('تحديث مرحلة الحجز', 'Advance Booking Lifecycle')}
                            </h3>

                            <form onSubmit={submitTransition} className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold uppercase text-stone-600 dark:text-stone-300 mb-1">
                                        {tr('المرحلة التالية', 'Next Stage')}
                                    </label>
                                    <Select
                                        id="next-status"
                                        value={transitionForm.data.target_status}
                                        onChange={(e) => transitionForm.setData('target_status', e.target.value)}
                                        className="dark:bg-stone-800 dark:border-stone-700 rounded-xl"
                                    >
                                        <option value="">{tr('— اختاري المرحلة التالية —', '— Choose Next Stage —')}</option>
                                        {NEXT_STATES[booking.status] && (
                                            <option value={NEXT_STATES[booking.status]}>
                                                {t(`status.${NEXT_STATES[booking.status]}`, NEXT_STATES[booking.status])}
                                            </option>
                                        )}
                                        {statuses.map((st) => (
                                            <option key={st} value={st}>
                                                {t(`status.${st}`, st)}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <label className="block font-semibold uppercase text-stone-600 dark:text-stone-300 mb-1">
                                        {tr('ملاحظات التحديث (اختياري)', 'Notes / Reason (Optional)')}
                                    </label>
                                    <Textarea
                                        id="reason"
                                        value={transitionForm.data.reason}
                                        onChange={(e) => transitionForm.setData('reason', e.target.value)}
                                        placeholder={tr('تم فحص الفستان وتسليمه للعميلة بنجاح…', 'Handover notes…')}
                                        rows={2}
                                        className="dark:bg-stone-800 dark:border-stone-700 rounded-xl"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="champagne"
                                    size="sm"
                                    disabled={!transitionForm.data.target_status || transitionForm.processing}
                                    className="w-full text-xs font-semibold mt-2"
                                >
                                    <Send className={cn("h-3.5 w-3.5", isRtl ? "ml-1.5" : "mr-1.5")} />
                                    {tr('تحديث حالة الحجز الآن', 'Update Booking Status')}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Damage Claim Modal */}
                <Modal open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
                    <ModalContent className="max-w-md bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xl" dir={isRtl ? 'rtl' : 'ltr'}>
                        <ModalTitle className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-rose-600" />
                            <span>{tr('تسجيل بلاغ تلفيات وفتح نزاع', 'File Damage Claim & Dispute')}</span>
                        </ModalTitle>
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                            {tr(
                                'وفقاً لسياسة المنصة، يتطلب خصم أي جزء من التأمين تقريراً يوضح موضع التلف والتكلفة التقديرية للإصلاح لمراجعته من الإدارة المركزية.',
                                'Platform policy requires a detailed description of damage and estimated repair cost for administrative review.'
                            )}
                        </p>

                        <form onSubmit={submitClaim} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('وصف دقيق للتلفيات (Damage Description)', 'Damage Description')}
                                </label>
                                <Textarea
                                    value={claimForm.data.damage_description}
                                    onChange={(e) => claimForm.setData('damage_description', e.target.value)}
                                    placeholder={tr('مثال: تمزق في البطانة السفلية بطول 10 سم، حرق مكواة سطحي…', 'e.g. 10cm tear in lining, iron scorch mark…')}
                                    rows={3}
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 text-xs rounded-xl"
                                    required
                                />
                                {claimForm.errors.damage_description && (
                                    <p className="text-xs text-rose-600 mt-1">{claimForm.errors.damage_description}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('تكلفة الإصلاح المقدرة بالجنيه (Estimated Repair Cost)', 'Repair Cost (EGP)')}
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    value={claimForm.data.repair_cost}
                                    onChange={(e) => claimForm.setData('repair_cost', e.target.value)}
                                    placeholder="500"
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 text-xs rounded-xl"
                                    required
                                />
                                {claimForm.errors.repair_cost && (
                                    <p className="text-xs text-rose-600 mt-1">{claimForm.errors.repair_cost}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsClaimModalOpen(false)} className="text-xs">
                                    {tr('إلغاء', 'Cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="danger"
                                    size="sm"
                                    disabled={claimForm.processing || !claimForm.data.damage_description.trim() || !claimForm.data.repair_cost}
                                    className="text-xs font-semibold"
                                >
                                    {claimForm.processing ? tr('جاري التسجيل…', 'Submitting…') : tr('تأكيد البلاغ وفتح النزاع', 'Submit Claim & Open Dispute')}
                                </Button>
                            </div>
                        </form>
                    </ModalContent>
                </Modal>
            </div>
        </AtelierLayout>
    );
}
