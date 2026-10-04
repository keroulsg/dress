import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency } from '@/Lib/currency';
import { CreditCard, ArrowDownRight, CheckCircle, RefreshCcw, Search, DollarSign } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface Props {
    transactions: {
        data: any[];
        links: any[];
        total: number;
    };
    stats: {
        total_volume: number;
        total_transactions: number;
        successful: number;
        pending: number;
        refunded: number;
    };
    filters: {
        search?: string;
        type?: string;
        status?: string;
    };
}

export default function PaymentsIndex({ transactions, stats, filters }: Props) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/payments',
            { search: searchTerm, type: filters.type, status: filters.status },
            { preserveState: true }
        );
    };

    return (
        <AdminLayout>
            <Head title={tr('مراقبة المدفوعات والعمليات | Maison Admin', 'Payments & Transactions | Maison Admin')} />

            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                    {tr('مراقبة المدفوعات وبوابات الدفع', 'Payments & Gateways Monitoring')}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {tr(
                        'سجلات المعاملات، حركات الـ Escrow، مبالغ التأمين، والمستردات عبر بوابات الدفع الإلكتروني',
                        'Transaction logs, Escrow movements, deposits, and refunds via payment gateways'
                    )}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('حجم التداول المكتمل', 'Completed Volume')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">
                        {formatCurrency(stats.total_volume, 'EGP')}
                    </p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('إجمالي المبالغ المحصلة', 'Total collected amounts')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('العمليات الناجحة', 'Successful Payments')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.successful}</p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                        {tr('عملية دفع مكتملة', 'Completed transactions')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('عمليات قيد المعالجة', 'Pending Payments')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <RefreshCcw className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.pending}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('بانتظار تأكيد بوابة الدفع', 'Awaiting gateway confirmation')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('مستردات وتأمينات معادة', 'Refunds & Returns')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                            <ArrowDownRight className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.refunded}</p>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 block">
                        {tr('عمليات استرداد ناجحة', 'Processed refunds')}
                    </span>
                </div>
            </div>

            {/* Filter */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 mb-6 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3 h-4 w-4 text-stone-400`} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={tr('بحث بمرجع البوابة أو اسم العميل…', 'Search by gateway reference or customer…')}
                            className={`w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 ${
                                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                            } py-2.5 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:border-amber-600 focus:bg-white dark:focus:bg-stone-900 focus:outline-none transition-colors`}
                        />
                    </div>
                </form>
            </div>

            {/* Transactions Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
                <div className="overflow-x-auto">
                    <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                        <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3.5">{tr('المرجع ونوع العملية', 'Ref & Type')}</th>
                                <th className="px-5 py-3.5">{tr('المستخدم / العميل', 'Customer / User')}</th>
                                <th className="px-5 py-3.5">{tr('الأتيليه المعني', 'Atelier')}</th>
                                <th className="px-5 py-3.5">{tr('المبلغ والعملة', 'Amount')}</th>
                                <th className="px-5 py-3.5">{tr('طريقة الدفع', 'Payment Method')}</th>
                                <th className="px-5 py-3.5">{tr('الحالة', 'Status')}</th>
                                <th className="px-5 py-3.5">{tr('التاريخ', 'Date')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                            {transactions.data.length > 0 ? (
                                transactions.data.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-mono font-bold text-amber-700 dark:text-amber-400">
                                                {tx.gateway_reference || tx.idempotency_key || `TX-${tx.id}`}
                                            </p>
                                            <p className="text-[11px] text-stone-500 dark:text-stone-400 capitalize mt-0.5">
                                                {tx.type?.replace('_', ' ') || 'Rental Payment'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-stone-900 dark:text-stone-100">
                                                {tx.user?.name || tr('مجهول', 'Anonymous')}
                                            </p>
                                            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                                                {tx.user?.email || '—'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-stone-600 dark:text-stone-300">
                                            {tx.atelier?.business_name || tr('المنصة المركزية', 'Central Platform')}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-stone-900 dark:text-stone-100">
                                            {formatCurrency(tx.amount, tx.currency || 'EGP')}
                                        </td>
                                        <td className="px-5 py-4 text-stone-600 dark:text-stone-300 capitalize">
                                            {tx.payment_method?.replace('_', ' ') || 'Credit Card'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                                    tx.status === 'captured'
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                        : tx.status === 'refunded'
                                                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                                }`}
                                            >
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-stone-400 dark:text-stone-500 font-mono text-[11px]">
                                            {new Date(tx.created_at).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-stone-400 dark:text-stone-500">
                                        {tr('لا توجد حركات مالية مسجلة حالياً.', 'No payment transactions recorded yet.')}
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
