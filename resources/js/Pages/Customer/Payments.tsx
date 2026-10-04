import React from 'react';
import { Head } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatCurrency } from '@/Lib/currency';
import { Badge } from '@/Components/UI/Badge';
import { CreditCard, DollarSign, Receipt, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface PaymentsProps {
    transactions: Array<{
        id: number;
        booking_id: number | null;
        type: string;
        amount: string;
        currency: string;
        status: string;
        payment_method: string;
        created_at: string | null;
    }>;
}

export default function CustomerPayments({ transactions }: PaymentsProps) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';

    return (
        <CustomerLayout>
            <Head title={tr('سجل المدفوعات والتأمينات | Maison Rentale', 'Payments & Receipts | Maison Rentale')} />

            <div className="space-y-6">
                <div>
                    <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">
                        {tr('سجل المدفوعات والتأمينات (Payments & Receipts)', 'Payments & Escrow Receipts')}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {tr(
                            'فواتير الإيجار، مبالغ التأمين المحتجزة، والإيداعات المستردة لحسابك',
                            'Rental invoices, held security deposits, and refunded escrow returns'
                        )}
                    </p>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden">
                    <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                            {tr(`جميع العمليات المالية (${transactions.length})`, `All Financial Transactions (${transactions.length})`)}
                        </span>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-sm text-stone-400 dark:text-stone-500">
                            <CreditCard className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                {tr('لا توجد عمليات دفع مسجلة حتى الآن.', 'No payment records registered yet.')}
                            </p>
                            <p className="text-xs mt-1">
                                {tr(
                                    'ستظهر هنا فواتير الحجوزات وإيصالات استرداد التأمين فور سدادها.',
                                    'Invoices and security refund receipts will appear here once processed.'
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                                <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="px-6 py-3">{tr('رقم العملية', 'Transaction ID')}</th>
                                        <th className="px-6 py-3">{tr('النوع', 'Type')}</th>
                                        <th className="px-6 py-3">{tr('طريقة الدفع', 'Payment Method')}</th>
                                        <th className="px-6 py-3">{tr('المبلغ', 'Amount')}</th>
                                        <th className="px-6 py-3">{tr('الحالة', 'Status')}</th>
                                        <th className="px-6 py-3">{tr('التاريخ', 'Date')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-stone-900 dark:text-stone-100">#{t.id}</td>
                                            <td className="px-6 py-4 font-semibold text-stone-900 dark:text-stone-100 capitalize">
                                                {t.type.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 text-stone-500 dark:text-stone-400 capitalize">
                                                {t.payment_method.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                                                {formatCurrency(t.amount, t.currency)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge tone={t.status === 'captured' ? 'success' : 'warning'}>{t.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-stone-500 dark:text-stone-400">
                                                {t.created_at || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
