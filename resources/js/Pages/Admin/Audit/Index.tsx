import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Clock, ShieldCheck, Activity, Search, Terminal } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface Props {
    logs: {
        data: any[];
        links: any[];
        total: number;
    };
    stats: {
        total_events: number;
        today_events: number;
        actions_tracked: number;
    };
    filters: {
        search?: string;
        action?: string;
    };
}

export default function AuditIndex({ logs, stats, filters }: Props) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/audit', { search: searchTerm, action: filters.action }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title={tr('سجل العمليات والتدقيق الأمني | Maison Admin', 'Audit Logs & Security | Maison Admin')} />

            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                    {tr('سجل الرقابة والتدقيق الأمني (Audit Log)', 'Security & Platform Audit Log')}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {tr(
                        'تسجيل كامل غير قابل للتعديل لكافة الإجراءات الإدارية، التعديلات الحساسة، والحركات الأمنية',
                        'Immutable chronological trail of all administrative actions, sensitive edits, and security events'
                    )}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('إجمالي الأحداث المسجلة', 'Total Events')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.total_events}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('عملية موثقة في قاعدة البيانات', 'Recorded actions in database')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('أحداث اليوم', 'Today Events')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.today_events}</p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                        {tr('عمليات تمت خلال 24 ساعة', 'Events in last 24 hours')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('أنواع الحركات المراقبـة', 'Tracked Action Types')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <ShieldCheck className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.actions_tracked}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('أفعال أمنية وتجارية مميزة', 'Distinct security & business actions')}
                    </span>
                </div>
            </div>

            {/* Audit Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
                <div className="overflow-x-auto">
                    <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                        <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3.5">{tr('الحدث (Action)', 'Action')}</th>
                                <th className="px-5 py-3.5">{tr('المنفذ (Actor)', 'Actor')}</th>
                                <th className="px-5 py-3.5">{tr('الهدف (Target)', 'Target')}</th>
                                <th className="px-5 py-3.5">{tr('عنوان الـ IP', 'IP Address')}</th>
                                <th className="px-5 py-3.5">{tr('التوقيت الدقيق', 'Timestamp')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                            {logs.data.length > 0 ? (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-2.5 py-1 rounded-lg">
                                                <Terminal className="h-3 w-3 text-amber-700 dark:text-amber-400" />
                                                <span>{log.action}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-stone-900 dark:text-stone-100">{log.user?.name || tr('النظام (System)', 'System')}</p>
                                            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">{log.user?.email || 'automated'}</p>
                                        </td>
                                        <td className="px-5 py-4 font-mono text-stone-500 dark:text-stone-400 text-[11px]">
                                            {log.auditable_type ? `${log.auditable_type} #${log.auditable_id}` : 'General Platform'}
                                        </td>
                                        <td className="px-5 py-4 font-mono text-stone-500 dark:text-stone-400 text-[11px]">
                                            {log.ip_address || '127.0.0.1'}
                                        </td>
                                        <td className="px-5 py-4 text-stone-400 dark:text-stone-500 font-mono text-[11px]">
                                            {new Date(log.created_at).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-stone-400 dark:text-stone-500">
                                        {tr('لا توجد سجلات تدقيق سابقة مسجلة.', 'No audit log entries recorded yet.')}
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
