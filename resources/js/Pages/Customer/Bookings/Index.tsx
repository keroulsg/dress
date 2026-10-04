import { Link } from '@inertiajs/react';
import { CreditCard, Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import type { PageProps } from '../../../types';

import { formatDateRange } from '../../../Lib/dates';
import { formatCurrency } from '../../../Lib/currency';
import { bookingStatus } from '../../../Lib/tokens';
import { EmptyState } from '../../../Components/Feedback/EmptyState';
import CustomerLayout from '../../../Layouts/CustomerLayout';
import { useLanguage } from '../../../Contexts/LanguageContext';

type BookingsIndexProps = PageProps<{
    bookings: Array<{
        id: number;
        booking_reference: string;
        status: string;
        start_date: string | null;
        end_date: string | null;
        grand_total: string;
        currency: string;
        atelier: string | null;
        dress_title: string | null;
        dress_slug?: string | null;
        dress_id?: number | null;
        payment_url?: string | null;
    }>;
    pagination: { total: number; current_page: number; last_page: number };
}>;

export default function BookingsIndex({ bookings }: BookingsIndexProps) {
    const { tr, isRtl } = useLanguage();

    return (
        <CustomerLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                        {tr('حجوزاتي وطلبات الفساتين', 'My Bookings & Orders')}
                    </h1>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {tr('متابعة حالة حجوزات الفساتين، مواعيد التسليم، وسداد العربون والتأمين.', 'Track your dress reservations, delivery schedules, and payment status.')}
                    </p>
                </div>

                {bookings.length === 0 ? (
                    <div className="mt-8">
                        <EmptyState
                            title={tr('لا توجد حجوزات حتى الآن', 'No bookings yet')}
                            description={tr('استعرضي تشكيلة الفساتين الفاخرة واحجزي فستانك المفضل لمناسبتك.', 'Browse our curated collection and reserve your dream gown.')}
                            actionLabel={tr('استعراض الكتالوج', 'Browse Collection')}
                            onAction={() => window.location.assign('/catalog')}
                        />
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {bookings.map((booking) => {
                            const isPendingPayment = booking.status === 'pending_payment';
                            const meta = bookingStatus[booking.status] ?? { color: '#78716C', label: booking.status };

                            return (
                                <li
                                    key={booking.id}
                                    className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all p-5"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                                    #{booking.booking_reference}
                                                </span>
                                                {isPendingPayment ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                                        <Clock className="h-3 w-3" />
                                                        {tr('بانتظار دفع العربون (10%)', 'Awaiting 10% Deposit')}
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                        style={{ color: meta.color, backgroundColor: `${meta.color}18` }}
                                                    >
                                                        {meta.label}
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                                                {booking.dress_title ?? tr('حجز فستان سهرة', 'Evening Dress Rental')}
                                            </h2>

                                            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5 text-stone-400" />
                                                    {booking.start_date && booking.end_date
                                                        ? formatDateRange(booking.start_date, booking.end_date)
                                                        : '—'}
                                                </span>
                                                {booking.atelier ? (
                                                    <>
                                                        <span className="text-stone-300 dark:text-stone-700">·</span>
                                                        <span>{booking.atelier}</span>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 dark:border-stone-800">
                                            <div>
                                                <p className="text-[11px] text-stone-400 dark:text-stone-500">{tr('إجمالي القيمة', 'Total Value')}</p>
                                                <p className="font-mono text-base font-bold text-stone-900 dark:text-stone-100">
                                                    {formatCurrency(booking.grand_total, booking.currency)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isPendingPayment && (
                                                    <Link
                                                        href={booking.payment_url || `/account/bookings/${booking.id}`}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-colors"
                                                    >
                                                        <CreditCard className="h-3.5 w-3.5" />
                                                        {tr('سداد العربون 10%', 'Pay 10% Deposit')}
                                                    </Link>
                                                )}
                                                <Link
                                                    href={`/account/bookings/${booking.id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-4 py-1"
                                                >
                                                    {tr('عرض التفاصيل', 'View Details')}
                                                    {isRtl ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </CustomerLayout>
    );
}