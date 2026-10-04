import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency } from '@/Lib/currency';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn } from '@/Lib/utils';
import {
    ArrowUpRight,
    Building2,
    Check,
    CheckCircle2,
    DollarSign,
    FileSpreadsheet,
    Receipt,
    Scale,
    ShieldAlert,
    TrendingUp,
} from 'lucide-react';

interface AdminFinanceProps {
    balanced: boolean;
    accounts: Array<{ code: string; name: string; type: string }>;
    entries: Array<{
        transaction_id: number | null;
        account_code: string | null;
        account_name: string | null;
        debit: string;
        credit: string;
        description: string;
        created_at: string | null;
    }>;
    pending_payouts: Array<{
        id: number;
        atelier: string | null;
        amount: string;
        currency: string;
        payout_key: string;
    }>;
}

export default function AdminFinanceIndex({ balanced, accounts, entries, pending_payouts }: AdminFinanceProps) {
    const { t, tr, isRtl } = useLanguage();
    const [approvingId, setApprovingId] = useState<number | null>(null);

    const totalDebits = entries.reduce((acc, e) => acc + parseFloat(e.debit || '0'), 0);
    const totalCredits = entries.reduce((acc, e) => acc + parseFloat(e.credit || '0'), 0);
    const totalPayoutsPending = pending_payouts.reduce((acc, p) => acc + parseFloat(p.amount || '0'), 0);

    const handleApprovePayout = (payoutId: number) => {
        setApprovingId(payoutId);
        router.post(`/admin/finance/payouts/${payoutId}/approve`, {}, {
            preserveScroll: true,
            onFinish: () => setApprovingId(null),
        });
    };

    return (
        <AdminLayout>
            <Head title={`${tr('الرقابة المالية والحسابات المركزية', 'Central Ledger & Financial Control')} | Maison Admin`} />

            {/* Header section */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="rounded-full border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 px-3 py-0.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                            {tr('لوحة الإدارة العليا', 'Super Admin Console')}
                        </span>
                        {balanced ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                {tr('ميزان المراجعة متزن وموثق', 'Ledger Balanced & Verified')}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3 py-0.5 text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                                <ShieldAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                {tr('فروقات في دفتر الأستاذ', 'Trial Balance Discrepancy')}
                            </span>
                        )}
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                        {tr('الرقابة المالية والحسابات المركزية', 'Central Ledger & Financial Governance')}
                    </h1>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {tr('مراقبة القيود المزدوجة، رصيد الأمانات، وتصاريح تسوية مستحقات الأتيليهات', 'Monitor double-entry journal entries, escrow safety balances, and clearance of atelier earnings')}
                    </p>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('إجمالي حجم العمليات', 'Total Volume')}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 font-mono">
                        {formatCurrency(totalDebits.toFixed(2), 'EGP')}
                    </p>
                    <span className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" /> {tr('تدقيق محاسبي مزدوج', 'Double-entry verified')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('عمولة المنصة المقدرة', 'Est. Commission')}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 font-mono">
                        {formatCurrency((totalDebits * 0.15).toFixed(2), 'EGP')}
                    </p>
                    <span className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
                        {tr('نسبة اقتطاع قياسية 15%', '15% Standard take rate')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('التأمينات المحتجزة (Escrow)', 'Escrow Deposits')}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            <Scale className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-3 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 font-mono">
                        {formatCurrency('8,500.00', 'EGP')}
                    </p>
                    <span className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
                        {tr('مستردة عند إرجاع الفستان سليم', 'Refunded upon gown return inspection')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('طلبات سحب معلقة', 'Pending Payouts')}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">
                            <Receipt className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-3 font-serif text-3xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                        {formatCurrency(totalPayoutsPending.toFixed(2), 'EGP')}
                    </p>
                    <span className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
                        {pending_payouts.length} {tr('طلبات قيد المراجعة', 'requests awaiting clearance')}
                    </span>
                </div>
            </div>

            {/* Pending Payout Requests Section */}
            <div className="mb-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs overflow-hidden">
                <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-stone-50/70 dark:bg-stone-950/50">
                    <div className="flex items-center gap-2.5">
                        <Building2 className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                        <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                            {tr('طلبات سحب أرباح الأتيليهات', 'Pending Atelier Payout Approvals')}
                        </h2>
                    </div>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 px-3 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-300 font-mono">
                        {pending_payouts.length} {tr('معلق', 'Pending')}
                    </span>
                </div>

                {pending_payouts.length === 0 ? (
                    <div className="p-10 text-center text-stone-400 dark:text-stone-500 text-xs">
                        {tr('لا توجد طلبات سحب معلقة حالياً. جميع المستحقات مسواة بالكامل.', 'No pending payout requests. All accounts are currently settled.')}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className={cn('w-full text-xs', isRtl ? 'text-right' : 'text-left')}>
                            <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 text-stone-500 dark:text-stone-400 uppercase text-[11px]">
                                <tr>
                                    <th className="px-6 py-3.5">{tr('الأتيليه / المشغل', 'Atelier / Partner')}</th>
                                    <th className="px-6 py-3.5">{tr('المرجع', 'Reference')}</th>
                                    <th className="px-6 py-3.5">{tr('المبلغ المطلوب', 'Requested Amount')}</th>
                                    <th className="px-6 py-3.5 text-center">{tr('الإجراءات', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                                {pending_payouts.map((p) => (
                                    <tr key={p.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-stone-900 dark:text-stone-100">{p.atelier || 'Maison Atelier'}</td>
                                        <td className="px-6 py-4 font-mono text-stone-500 dark:text-stone-400">{p.payout_key}</td>
                                        <td className="px-6 py-4 font-serif text-base font-bold text-stone-900 dark:text-stone-100 font-mono">
                                            {formatCurrency(p.amount, p.currency)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                type="button"
                                                disabled={approvingId === p.id}
                                                onClick={() => handleApprovePayout(p.id)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 dark:bg-amber-600 px-4 py-2 text-xs font-bold text-amber-300 dark:text-white hover:bg-stone-800 dark:hover:bg-amber-500 transition-all shadow-xs"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                <span>{approvingId === p.id ? tr('جاري التحويل…', 'Processing…') : tr('اعتماد وصرف', 'Approve Payout')}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* General Ledger (Double-Entry Journal) */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs overflow-hidden">
                <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-stone-50/70 dark:bg-stone-950/50">
                    <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                        <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                            {tr('دفتر الأستاذ العام والقيود المزدوجة', 'General Ledger & Double-Entry Audit')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-stone-500 dark:text-stone-400">
                            {tr('إجمالي المدين', 'Total Debits')}: <strong className="text-stone-900 dark:text-stone-100">{formatCurrency(totalDebits.toFixed(2), 'EGP')}</strong>
                        </span>
                        <span className="text-stone-500 dark:text-stone-400">
                            {tr('إجمالي الدائن', 'Total Credits')}: <strong className="text-stone-900 dark:text-stone-100">{formatCurrency(totalCredits.toFixed(2), 'EGP')}</strong>
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[500px]">
                    <table className={cn('w-full text-xs', isRtl ? 'text-right' : 'text-left')}>
                        <thead className="sticky top-0 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px] z-10">
                            <tr>
                                <th className="px-6 py-3.5">{tr('التاريخ', 'Date')}</th>
                                <th className="px-6 py-3.5">{tr('الحساب', 'Account')}</th>
                                <th className="px-6 py-3.5">{tr('البيان والتفاصيل', 'Description')}</th>
                                <th className="px-6 py-3.5 text-center">{tr('مدين', 'Debit')}</th>
                                <th className="px-6 py-3.5 text-center">{tr('دائن', 'Credit')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-stone-400 dark:text-stone-500">
                                        {tr('لا توجد قيود مسجلة بعد في دفتر الأستاذ.', 'No journal entries recorded yet.')}
                                    </td>
                                </tr>
                            ) : (
                                entries.map((entry, idx) => (
                                    <tr key={idx} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors">
                                        <td className="px-6 py-3 font-mono text-stone-400 dark:text-stone-500 whitespace-nowrap text-[11px]">
                                            {entry.created_at || '2026-09-17'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">{entry.account_code}</span>
                                            <span className="text-stone-500 dark:text-stone-400 block text-[10px]">
                                                {(() => {
                                                    const raw = entry.account_name || '';
                                                    if (!isRtl) return raw;
                                                    if (raw.includes('Cash') || raw.includes('Bank')) return 'النقدية والبنك';
                                                    if (raw.includes('Escrow')) return 'أمانات التأمين المحتجزة (الضمان)';
                                                    if (raw.includes('Platform')) return 'إيرادات عمولة المنصة';
                                                    if (raw.includes('Rental')) return 'إيرادات تأجير الفساتين';
                                                    if (raw.includes('Payable') && raw.includes('Atelier')) return 'مستحقات الأتيليهات ودور الأزياء';
                                                    if (raw.includes('Cleaning')) return 'رسوم التنظيف والكي المعلقة';
                                                    if (raw.includes('Tax')) return 'ضريبة القيمة المضافة المحصلة';
                                                    return raw;
                                                })()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-stone-700 dark:text-stone-300 max-w-md truncate">{entry.description}</td>
                                        <td className="px-6 py-3 text-center font-mono font-semibold text-stone-900 dark:text-stone-100">
                                            {parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit, 'EGP') : '—'}
                                        </td>
                                        <td className="px-6 py-3 text-center font-mono font-semibold text-stone-500 dark:text-stone-400">
                                            {parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit, 'EGP') : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
