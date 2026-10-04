import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AtelierLayout from '@/Layouts/AtelierLayout';
import { formatCurrency } from '@/Lib/currency';
import { ArrowDownCircle, CheckCircle2, DollarSign, Wallet } from 'lucide-react';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Badge } from '@/Components/UI/Badge';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn } from '@/Lib/utils';

interface AtelierFinanceProps {
    atelier: { id: number; business_name: string };
    available: { amount: string; currency: string };
    payouts: Array<{
        id: number;
        amount: string;
        currency: string;
        status: string;
        paid_at: string | null;
    }>;
}

export default function AtelierFinanceIndex({ atelier, available, payouts }: AtelierFinanceProps) {
    const { t, tr, isRtl } = useLanguage();
    const [isRequesting, setIsRequesting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: available.amount || '0',
    });

    const handleSubmitPayout = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/atelier/${atelier.id}/finance/payout`, {
            onSuccess: () => {
                setIsRequesting(false);
                reset();
            },
        });
    };

    return (
        <AtelierLayout
            title={tr('الأرباح والتحويلات المالية', 'Revenue & Payouts')}
            breadcrumbs={[{ label: tr('الأرباح والمالية', 'Finance') }]}
        >
            <Head title={`${tr('الأرباح والتحويلات المالية', 'Revenue & Payouts')} | ${atelier.business_name}`} />

            <div className="space-y-8">
                {/* Balance and Earnings Widget */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                                {tr('الرصيد المتاح للسحب الفوري', 'Available Balance for Payout')}
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                                <Wallet className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-baseline gap-3">
                            <span className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-100">
                                {formatCurrency(available.amount, available.currency)}
                            </span>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {tr('متاح للتحويل البنكي الفوري', 'Ready for instant bank transfer')}
                            </span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                            {tr(
                                'يتم تسوية وتحديث الرصيد بعد اكتمال مرحلة فحص الفستان المسترجع واستلامه بنجاح بدون نزاعات.',
                                'Funds are automatically cleared and released after post-return inspection is completed.'
                            )}
                        </p>

                        <div className="pt-2 flex gap-3">
                            <Button
                                variant="champagne"
                                onClick={() => setIsRequesting((prev) => !prev)}
                                className="text-xs font-semibold"
                            >
                                <ArrowDownCircle className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} />
                                {isRequesting
                                    ? tr('إلغاء طلب السحب', 'Cancel Request')
                                    : tr('طلب سحب الأرباح (Request Payout)', 'Request Payout Transfer')}
                            </Button>
                        </div>

                        {isRequesting && (
                            <form onSubmit={handleSubmitPayout} className="mt-4 border-t border-stone-100 dark:border-stone-800 pt-5 max-w-md space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                                        {tr('المبلغ المطلوب (EGP)', 'Requested Amount (EGP)')}
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        max={parseFloat(available.amount)}
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 rounded-xl"
                                        required
                                    />
                                    {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
                                </div>
                                <Button type="submit" variant="primary" disabled={processing} className="text-xs font-semibold">
                                    <CheckCircle2 className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} />
                                    {processing ? tr('جاري الإرسال…', 'Processing…') : tr('تأكيد طلب التحويل', 'Confirm Transfer Request')}
                                </Button>
                            </form>
                        )}
                    </div>

                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                            {tr('سياسة التسوية والعمولة', 'Settlement & Payout Policy')}
                        </h3>
                        <div className="space-y-3 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                                <span>{tr('عمولة المنصة', 'Platform Commission')}</span>
                                <strong className="text-stone-900 dark:text-stone-100 font-semibold">15%</strong>
                            </div>
                            <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                                <span>{tr('فترة الإفراج المالي', 'Clearing Window')}</span>
                                <strong className="text-stone-900 dark:text-stone-100 font-semibold">{tr('24 ساعة بعد الفحص', '24h post-inspection')}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>{tr('طريقة التحويل', 'Payout Method')}</span>
                                <strong className="text-stone-900 dark:text-stone-100 font-semibold">{tr('تحويل بنكي / Instapay', 'Bank / Instapay')}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payout History Table */}
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs overflow-hidden">
                    <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/40">
                        <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                            {tr('سجل التحويلات والمسحوبات', 'Payout History & Ledger')}
                        </h2>
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                            {payouts.length} {tr('عمليات', 'Transactions')}
                        </span>
                    </div>

                    {payouts.length === 0 ? (
                        <div className="p-8 text-center text-xs text-stone-400 dark:text-stone-500">
                            {tr('لم يتم تسجيل أي عمليات سحب حتى الآن.', 'No payout transactions recorded yet.')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-xs">
                                <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400 uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-3.5 text-start">{tr('رقم العملية', 'Transaction ID')}</th>
                                        <th className="px-6 py-3.5 text-start">{tr('المبلغ', 'Amount')}</th>
                                        <th className="px-6 py-3.5 text-start">{tr('الحالة', 'Status')}</th>
                                        <th className="px-6 py-3.5 text-start">{tr('تاريخ التنفيذ', 'Execution Date')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {payouts.map((p) => (
                                        <tr key={p.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                                                #{p.id}
                                            </td>
                                            <td className="px-6 py-4 font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                                                {formatCurrency(p.amount, p.currency)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge tone={p.status === 'paid' ? 'success' : 'warning'}>
                                                    {p.status === 'paid' ? tr('تم التحويل', 'Paid & Settled') : tr('قيد المراجعة', 'Pending Review')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-stone-500 dark:text-stone-400">
                                                {p.paid_at || tr('معلق', 'Pending')}
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
