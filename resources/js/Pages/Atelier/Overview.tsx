import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AtelierLayout from '@/Layouts/AtelierLayout';
import { formatCurrency } from '@/Lib/currency';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn } from '@/Lib/utils';
import {
    CalendarDays,
    Clock,
    DollarSign,
    Images,
    Plus,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

interface AtelierOverviewProps {
    atelier: { id: number; business_name: string; is_active: boolean };
    kyc?: {
        is_verified: boolean;
        status: string;
        rejection_reason?: string | null;
    };
    stats: {
        total_garments: number;
        active_rentals: number;
        available_earnings: string;
        currency: string;
    };
    recent_bookings: Array<{
        id: number;
        booking_reference: string;
        status: string;
        start_date: string | null;
        end_date: string | null;
        grand_total: string;
        renter_name: string | null;
        dress_title: string | null;
    }>;
}

export default function AtelierOverview({ atelier, kyc, stats, recent_bookings }: AtelierOverviewProps) {
    const { t, isRtl } = useLanguage();

    return (
        <AtelierLayout title={isRtl ? 'نظرة عامة على الأتيليه' : 'Studio Overview'} breadcrumbs={[{ label: isRtl ? 'الرئيسية' : 'Overview' }]}>
            <Head title={`${isRtl ? 'لوحة تحكم الأتيليه' : 'Studio Overview'} | ${atelier.business_name}`} />

            <div className="space-y-6">
                {/* Atelier KYC Status Banner (Type 1) */}
                {kyc?.is_verified ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <p className="text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                                <span className="font-semibold">{isRtl ? 'تم توثيق هوية الأتيليه بنجاح من إدارة المنصة (النوع 1).' : 'Atelier Identity Verified & Accredited.'}</span>{' '}
                                {isRtl ? 'المتجر موثق رسميًا ومتاح لاستقبال وتأكيد حجوزات الفساتين.' : 'Your studio is verified and active.'}
                            </p>
                        </div>
                        <Badge tone="success">{isRtl ? 'موثق ومعتمد' : 'Verified'}</Badge>
                    </div>
                ) : kyc?.status === 'pending' ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <p className="text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                                <span className="font-semibold">{isRtl ? 'طلب توثيق الأتيليه قيد مراجعة إدارة المنصة (النوع 1).' : 'Atelier verification pending review.'}</span>{' '}
                                {isRtl ? 'يقوم مدير المنصة بمطابقة المستندات لتفعيل المتجر كاملاً.' : 'Platform admin is reviewing your identity documents.'}
                            </p>
                        </div>
                        <Badge tone="warning">{isRtl ? 'قيد المراجعة' : 'Pending'}</Badge>
                    </div>
                ) : kyc?.status === 'rejected' ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                            <p className="text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                                <span className="font-semibold">{isRtl ? 'تم رفض مستندات توثيق الأتيليه.' : 'Verification rejected.'}</span>{' '}
                                {kyc?.rejection_reason || (isRtl ? 'يرجى مراجعة صفحة الإعدادات لإعادة الرفع.' : 'Please update in settings.')}
                            </p>
                        </div>
                        <Link href={`/atelier/${atelier.id}/settings`} className="text-xs font-semibold text-rose-700 underline">
                            {isRtl ? 'تحديث المستند' : 'Update in Settings'}
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <p className="text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                                <span className="font-semibold">{isRtl ? 'يرجى توثيق هوية الأتيليه برفع البطاقة (النوع 1).' : 'Please verify atelier identity.'}</span>{' '}
                                {isRtl ? 'التوثيق يحمي حقوق الأتيليه ويمنح متجرك الشارة المعتمدة.' : 'Verification enables trusted reservations.'}
                            </p>
                        </div>
                        <Button asChild variant="champagne" size="sm" className="text-xs">
                            <Link href={`/atelier/${atelier.id}/settings`}>{isRtl ? 'توثيق الآن' : 'Verify Now'}</Link>
                        </Button>
                    </div>
                )}

                {/* Welcome Banner */}
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-rose dark:text-rose-400">
                                {t('atelier.overview.badge')}
                            </span>
                            <Badge tone={atelier.is_active ? 'success' : 'danger'}>
                                {atelier.is_active
                                    ? isRtl ? 'المتجر نشط ويستقبل حجوزات' : 'Store Active'
                                    : isRtl ? 'المتجر غير متصل' : 'Store Offline'}
                            </Badge>
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">{atelier.business_name}</h1>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            {t('atelier.overview.subtitle')}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button asChild variant="champagne" size="sm" className="text-xs">
                            <Link href={`/atelier/${atelier.id}/dresses/create`}>
                                <Plus className={cn('h-4 w-4', isRtl ? 'ml-1' : 'mr-1')} />
                                {t('atelier.overview.add_dress')}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                {t('atelier.overview.total_garments')}
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                                <Images className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">{stats.total_garments}</p>
                        <span className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                            {t('atelier.overview.total_garments_hint')}
                        </span>
                    </div>

                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                {t('atelier.overview.active_rentals')}
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                <CalendarDays className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">{stats.active_rentals}</p>
                        <span className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            {t('atelier.overview.active_rentals_hint')}
                        </span>
                    </div>

                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                {t('atelier.overview.available_earnings')}
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                            {formatCurrency(stats.available_earnings, stats.currency)}
                        </p>
                        <span className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                            {t('atelier.overview.available_earnings_hint')}
                        </span>
                    </div>
                </div>

                {/* Recent Bookings Table */}
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs overflow-hidden">
                    <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-stone-50/70 dark:bg-stone-950/50">
                        <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                            {t('atelier.overview.recent_bookings')}
                        </h2>
                        <Button asChild variant="ghost" size="sm" className="text-xs">
                            <Link href={`/atelier/${atelier.id}/bookings`}>
                                {t('atelier.overview.view_all_bookings')}
                            </Link>
                        </Button>
                    </div>

                    {recent_bookings.length === 0 ? (
                        <div className="p-8 text-center text-sm text-stone-500 dark:text-stone-400">
                            {t('atelier.overview.no_bookings')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className={cn('w-full text-xs', isRtl ? 'text-right' : 'text-left')}>
                                <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 text-stone-500 dark:text-stone-400 uppercase text-[11px]">
                                    <tr>
                                        <th className="px-6 py-3.5 font-semibold">{t('atelier.overview.col_ref')}</th>
                                        <th className="px-6 py-3.5 font-semibold">{t('atelier.overview.col_dress')}</th>
                                        <th className="px-6 py-3.5 font-semibold">{t('atelier.overview.col_renter')}</th>
                                        <th className="px-6 py-3.5 font-semibold">{t('atelier.overview.col_dates')}</th>
                                        <th className="px-6 py-3.5 font-semibold">{t('atelier.overview.col_amount')}</th>
                                        <th className="px-6 py-3.5 font-semibold">{t('atelier.overview.col_status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200/80 dark:divide-stone-800">
                                    {recent_bookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-stone-900 dark:text-stone-100">
                                                #{b.booking_reference}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-stone-900 dark:text-stone-100">
                                                {b.dress_title || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                                                {b.renter_name || (isRtl ? 'عميلة ميزون' : 'Customer')}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-stone-500 dark:text-stone-400">
                                                {b.start_date} {isRtl ? 'إلى' : 'to'} {b.end_date}
                                            </td>
                                            <td className="px-6 py-4 font-serif font-bold text-stone-900 dark:text-stone-100">
                                                {formatCurrency(b.grand_total, 'EGP')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge tone={b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'champagne'}>
                                                    {b.status === 'confirmed'
                                                        ? (isRtl ? 'مؤكد' : 'Confirmed')
                                                        : b.status === 'pending'
                                                          ? (isRtl ? 'قيد المراجعة' : 'Pending')
                                                          : b.status === 'awaiting_payment'
                                                            ? (isRtl ? 'بانتظار الدفع' : 'Awaiting Payment')
                                                            : b.status === 'in_transit' || b.status === 'dispatched'
                                                              ? (isRtl ? 'جاري التوصيل' : 'In Transit')
                                                              : b.status === 'cancelled'
                                                                ? (isRtl ? 'ملغي' : 'Cancelled')
                                                                : b.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AtelierLayout>
    );
}
