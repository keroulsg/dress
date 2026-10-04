import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency } from '@/Lib/currency';
import { Scale, AlertTriangle, CheckCircle2, XCircle, Search } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface Props {
    disputes: {
        data: any[];
        links: any[];
        total: number;
    };
    stats: {
        total: number;
        open: number;
        resolved: number;
        rejected: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function DisputesIndex({ disputes, stats, filters }: Props) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [decision, setDecision] = useState<'resolved' | 'rejected'>('resolved');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/disputes', { search: searchTerm, status: filters.status }, { preserveState: true });
    };

    const submitResolution = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDispute) return;

        router.post(
            `/admin/disputes/${selectedDispute.id}/resolve`,
            {
                status: decision,
                resolution: resolutionNotes,
            },
            {
                onSuccess: () => {
                    setSelectedDispute(null);
                    setResolutionNotes('');
                },
            }
        );
    };

    return (
        <AdminLayout>
            <Head title={tr('مركز التحكيم وفض النزاعات | Maison Admin', 'Disputes & Arbitration | Maison Admin')} />

            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                    {tr('مركز التحكيم وفض النزاعات', 'Arbitration & Dispute Resolution Center')}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {tr(
                        'الفصل العادل في نزاعات التلفيات، التأخير في الإرجاع، ومطالبات التعويض بين المستأجرات والأتيليهات',
                        'Fair adjudication on damage, return delays, and compensation between renters and ateliers'
                    )}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('إجمالي النزاعات', 'Total Disputes')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <Scale className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.total}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('قضية مسجلة بالمنصة', 'Registered platform cases')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('نزاعات مفتوحة وقيد المراجعة', 'Open Disputes')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.open}</p>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 block">
                        {tr('تتطلب قرار تحكيمي من الإدارة', 'Require administrative ruling')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('نزاعات تم الفصل فيها', 'Resolved Disputes')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.resolved}</p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                        {tr('صدر بها قرار تسوية مالي', 'Settled with resolution order')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('مطالبات مرفوضة', 'Rejected Claims')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                            <XCircle className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.rejected}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('عدم ثبوت الضرر', 'Damage claim unproven')}
                    </span>
                </div>
            </div>

            {/* Disputes Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
                <div className="overflow-x-auto">
                    <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                        <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3.5">{tr('النزاع ومرجع الحجز', 'Dispute & Ref')}</th>
                                <th className="px-5 py-3.5">{tr('رافع النزاع', 'Claimant')}</th>
                                <th className="px-5 py-3.5">{tr('سبب المطالبة', 'Reason')}</th>
                                <th className="px-5 py-3.5">{tr('الأتيليه والفستان', 'Atelier & Dress')}</th>
                                <th className="px-5 py-3.5">{tr('الحالة', 'Status')}</th>
                                <th className="px-5 py-3.5 text-center">{tr('القرار التحكيمي', 'Ruling')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                            {disputes.data.length > 0 ? (
                                disputes.data.map((dispute) => (
                                    <tr key={dispute.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-mono font-bold text-amber-700 dark:text-amber-400">#DISPUTE-{dispute.id}</p>
                                            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                                                {tr('حجز:', 'Booking:')} #{dispute.booking?.booking_reference || dispute.booking_id}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-stone-900 dark:text-stone-100">{dispute.opener?.name || tr('مستخدم', 'User')}</p>
                                            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">{dispute.opener?.email}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-stone-900 dark:text-stone-100">{dispute.reason}</p>
                                            <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                                                {dispute.description || tr('لا يوجد تفاصيل إضافية', 'No additional details')}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-stone-800 dark:text-stone-200 font-medium">
                                                {dispute.booking?.atelier?.business_name || tr('أتيليه', 'Atelier')}
                                            </p>
                                            <p className="text-[11px] text-stone-400 dark:text-stone-500">{dispute.booking?.dress?.title}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                                                {dispute.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedDispute(dispute)}
                                                className="px-3.5 py-1.5 rounded-lg bg-stone-900 dark:bg-amber-600 text-white font-medium hover:bg-stone-800 dark:hover:bg-amber-700 text-xs transition-all shadow-sm"
                                            >
                                                {tr('فصل وإصدار قرار', 'Adjudicate')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-stone-400 dark:text-stone-500">
                                        {tr('لا توجد نزاعات مفتوحة حالياً. كافة العمليات مستقرة.', 'No open disputes currently. All operations running smoothly.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Arbitration Modal */}
            {selectedDispute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-lg rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xl">
                        <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
                            {tr(`إصدار قرار التحكيم في النزاع #${selectedDispute.id}`, `Arbitration Ruling for Dispute #${selectedDispute.id}`)}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                            {tr('السبب:', 'Reason:')} {selectedDispute.reason} · {tr('رافع النزاع:', 'Claimant:')} {selectedDispute.opener?.name}
                        </p>

                        <form onSubmit={submitResolution} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('نوع القرار التحكيمي', 'Ruling Type')}
                                </label>
                                <select
                                    value={decision}
                                    onChange={(e) => setDecision(e.target.value as any)}
                                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:bg-white dark:focus:bg-stone-900 focus:outline-none"
                                >
                                    <option value="resolved">
                                        {tr('قبول النزاع وإلزام الطرف المخالف بالتعويض / الاسترداد', 'Accept dispute & issue compensation/refund order')}
                                    </option>
                                    <option value="rejected">
                                        {tr('رفض النزاع لعدم ثبوت الأضرار وإغلاق المطالبة', 'Reject claim due to unproven damages and close')}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('أسباب ومنطوق القرار (Resolution Notes)', 'Resolution Notes & Grounds')}
                                </label>
                                <textarea
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    rows={4}
                                    placeholder={tr(
                                        'اكتب التقرير التحكيمي الذي سيظهر للطرفين في لوحة الحسابات…',
                                        'Write the arbitration notes that will be visible to both parties…'
                                    )}
                                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-600 focus:bg-white dark:focus:bg-stone-900 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-amber-600 py-2.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors shadow-sm"
                                >
                                    {tr('اعتماد القرار وتطبيقه فوراً', 'Confirm & Enforce Ruling')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDispute(null)}
                                    className="rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-2.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                                >
                                    {tr('إلغاء', 'Cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
