import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency } from '@/Lib/currency';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn } from '@/Lib/utils';
import { Package, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

interface Props {
    bookings: {
        data: any[];
        links: any[];
        total: number;
    };
    stats: {
        total: number;
        confirmed: number;
        active_rentals: number;
        completed: number;
        cancelled: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function BookingsIndex({ bookings, stats, filters }: Props) {
    const { t, tr, isRtl } = useLanguage();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/bookings', { search: searchTerm, status: filters.status }, { preserveState: true });
    };

    const handleCancel = (id: number, ref: string) => {
        if (confirm(tr(`تحذير: هل أنت متأكد من رغبتك في إلغاء الحجز رقم ${ref}؟ سيتم رد التأمين وفقاً للقواعد.`, `Warning: Are you sure you want to cancel booking #${ref}? Security deposit will be refunded accordingly.`))) {
            router.patch(`/admin/bookings/${id}/cancel`);
        }
    };

    return (
        <AdminLayout>
            <Head title={`${tr('مراقبة الحجوزات وعقود التأجير', 'Bookings & Rental Contracts Governance')} | Maison Admin`} />

            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                    {tr('إدارة الحجوزات وعمليات التأجير', 'Bookings & Rental Lifecycle Governance')}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {tr('المراقبة الشاملة لدورات حياة التأجير، مواعيد التسليم والإرجاع، وإدارة الحالات الحرجة', 'Complete oversight of rental lifecycle, delivery and return dates, and dispute resolutions')}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('إجمالي الحجوزات', 'Total Bookings')}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                            <Package className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.total}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('عملية تأجير مسجلة', 'registered rental contracts')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('عقود جارية ومسلمة', 'Active Rentals')}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.active_rentals}</p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                        {tr('فساتين حالياً مع المستأجرات', 'gowns currently with clients')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('مكتمل ومسترد', 'Completed & Returned')}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.completed}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('تم الإرجاع وتصفية التأمين', 'returned with cleared security deposit')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('ملغي', 'Cancelled')}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.cancelled}</p>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 block">
                        {tr('حجوزات ملغاة', 'cancelled bookings')}
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 mb-6 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className={cn('absolute top-3 h-4 w-4 text-stone-400', isRtl ? 'right-3.5' : 'left-3.5')} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={tr('بحث برقم الحجز، المستأجرة أو الأتيليه…', 'Search by reference #, renter, or atelier…')}
                            className={cn(
                                'w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 py-2.5 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:border-amber-600 focus:bg-white dark:focus:bg-stone-900 focus:outline-none transition-colors',
                                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4',
                            )}
                        />
                    </div>
                </form>
            </div>

            {/* Bookings Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
                <div className="overflow-x-auto">
                    <table className={cn('w-full text-xs', isRtl ? 'text-right' : 'text-left')}>
                        <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/50 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3.5">{tr('المرجع والفستان', 'Ref & Gown')}</th>
                                <th className="px-5 py-3.5">{tr('المستأجرة', 'Renter')}</th>
                                <th className="px-5 py-3.5">{tr('الأتيليه', 'Atelier')}</th>
                                <th className="px-5 py-3.5">{tr('فترة التأجير', 'Rental Window')}</th>
                                <th className="px-5 py-3.5">{tr('المبلغ والتأمين', 'Total & Deposit')}</th>
                                <th className="px-5 py-3.5">{tr('الحالة', 'Status')}</th>
                                <th className="px-5 py-3.5 text-center">{tr('الإجراء', 'Action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                            {bookings.data.length > 0 ? (
                                bookings.data.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-mono font-bold text-amber-700 dark:text-amber-400">#{booking.booking_reference}</p>
                                            <p className="text-stone-900 dark:text-stone-100 font-medium text-xs mt-0.5 line-clamp-1">{booking.dress?.title || tr('فستان هوت كوتور', 'Haute Couture Gown')}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-stone-900 dark:text-stone-100">{booking.renter?.name || tr('عميل', 'Client')}</p>
                                            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">{booking.renter?.email}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-stone-700 dark:text-stone-300 font-medium">{booking.atelier?.business_name || 'Maison Atelier'}</span>
                                        </td>
                                        <td className="px-5 py-4 text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                                            {booking.rental_start_date} ➔ {booking.rental_end_date}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-stone-900 dark:text-stone-100">{formatCurrency(booking.total_price, 'EGP')}</p>
                                            <p className="text-[10px] text-stone-400 dark:text-stone-500">{tr('تأمين', 'Deposit')}: {formatCurrency(booking.deposit_amount, 'EGP')}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {booking.status !== 'cancelled' && booking.status !== 'returned' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancel(booking.id, booking.booking_reference)}
                                                    className="px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/40 hover:bg-rose-100/60 dark:hover:bg-rose-900/60 text-[11px] font-medium transition-all"
                                                >
                                                    {tr('إلغاء إداري', 'Admin Cancel')}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-stone-400 dark:text-stone-500">
                                        {tr('لا توجد حجوزات مسجلة مطابقة للبحث.', 'No bookings matching search query.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
