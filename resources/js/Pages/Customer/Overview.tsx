import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatCurrency } from '@/Lib/currency';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { IdentityStatusBanner } from '@/Modules/KYC';
import {
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    Heart,
    Package,
    Scale,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface CustomerOverviewProps {
    active_bookings: Array<{
        id: number;
        booking_reference: string;
        status: string;
        start_date: string | null;
        end_date: string | null;
        grand_total: string;
        currency: string;
        atelier: string | null;
        dress_title: string | null;
        payment_url?: string | null;
    }>;
    stats: {
        total_bookings: number;
        saved_count: number;
        open_disputes: number;
    };
    kyc: {
        is_verified: boolean;
        status: 'unverified' | 'pending' | 'verified' | 'rejected';
        rejection_reason?: string | null;
    };
}

export default function CustomerOverview({ active_bookings, stats, kyc }: CustomerOverviewProps) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';

    return (
        <CustomerLayout>
            <Head title={tr('لوحة تحكم العميل | Maison Rentale', 'Account Overview | Maison Rentale')} />

            <div className="space-y-8">
                {/* KYC Notification */}
                <IdentityStatusBanner status={kyc} />

                {/* Hero / Welcome */}
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                            {tr('لوحة تحكم العميل', 'Client Dashboard')}
                        </span>
                        <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 mt-1">
                            {tr('أهلاً بك في حسابك الخاص', 'Welcome to Your Private Account')}
                        </h1>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            {tr(
                                'تتبع حجوزاتك، إثباتات الهوية، وسجل المدفوعات والتأمينات المستردة',
                                'Track your bookings, identity verification, payments, and escrow deposits'
                            )}
                        </p>
                    </div>

                    <Button asChild variant="champagne" size="sm" className="text-xs">
                        <Link href="/catalog">{tr('تصفح فساتين جديدة', 'Browse Catalog')}</Link>
                    </Button>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                {tr('إجمالي الحجوزات', 'Total Bookings')}
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                                <Package className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">{stats.total_bookings}</p>
                        <span className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
                            {tr('حجوزات سابقة ونشطة', 'Active and past rentals')}
                        </span>
                    </div>

                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                {tr('حالة توثيق الهوية', 'Identity Status')}
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                            {kyc.is_verified ? tr('موثق بالكامل', 'Fully Verified') : tr('غير مكتمل', 'Unverified')}
                        </p>
                        <span className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
                            {kyc.is_verified ? tr('مؤهل لجميع الإيجارات', 'Eligible for instant rentals') : tr('يرجى رفع البطاقة', 'Please upload ID')}
                        </span>
                    </div>

                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                {tr('النزاعات المفتوحة', 'Open Disputes')}
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                                <Scale className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">{stats.open_disputes}</p>
                        <span className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
                            {tr('شكاوى وتذاكر دعم', 'Claims & support tickets')}
                        </span>
                    </div>
                </div>

                {/* Active Bookings Timeline */}
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden">
                    <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                            {tr(`الحجوزات النشطة الحالية (${active_bookings.length})`, `Current Active Bookings (${active_bookings.length})`)}
                        </span>
                        <Button asChild variant="ghost" size="sm" className="text-xs">
                            <Link href="/account/bookings">{tr('عرض كل الحجوزات', 'View All Bookings')}</Link>
                        </Button>
                    </div>

                    {active_bookings.length === 0 ? (
                        <div className="p-10 text-center text-sm text-stone-400 dark:text-stone-500">
                            <Package className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                {tr('لا توجد حجوزات نشطة حالياً.', 'No active bookings currently.')}
                            </p>
                            <p className="text-xs mt-1">
                                {tr('استكشفي كتالوج الفساتين لاختيار فستان لمناسبتك القادمة.', 'Explore our curated catalog to reserve your next luxury dress.')}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                            {active_bookings.map((b) => (
                                <div
                                    key={b.id}
                                    className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                                                #{b.booking_reference}
                                            </span>
                                            <Badge tone={b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : b.status === 'pending_payment' ? 'warning' : 'champagne'}>
                                                {b.status === 'confirmed'
                                                    ? tr('مؤكد', 'Confirmed')
                                                    : b.status === 'pending_payment'
                                                      ? tr('بانتظار دفع العربون 10%', 'Awaiting 10% Deposit')
                                                      : b.status === 'pending'
                                                        ? tr('قيد المراجعة', 'Pending')
                                                        : b.status === 'awaiting_payment'
                                                          ? tr('في انتظار الدفع', 'Awaiting Payment')
                                                          : b.status === 'cancelled'
                                                            ? tr('ملغي', 'Cancelled')
                                                            : b.status}
                                            </Badge>
                                        </div>
                                        <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                                            {b.dress_title || tr('فستان هوت كوتور فاخر', 'Haute Couture Dress')}
                                        </h3>
                                        <p className="text-xs text-stone-500 dark:text-stone-400">
                                            {tr('الأتيليه:', 'Atelier:')} {b.atelier || tr('ميزون أتيليه', 'Maison Atelier')}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:items-end gap-2">
                                        <span className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                                            {formatCurrency(b.grand_total, b.currency)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                                                {b.start_date} ← {b.end_date}
                                            </span>
                                            {b.payment_url && (
                                                <Button asChild size="sm" variant="champagne" className="text-xs font-semibold shadow-xs">
                                                    <Link href={b.payment_url}>{tr('سداد العربون 10%', 'Pay 10%')}</Link>
                                                </Button>
                                            )}
                                            <Button asChild size="sm" variant="outline" className="text-xs">
                                                <Link href={`/account/bookings/${b.id}`}>{tr('التفاصيل', 'Details')}</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
