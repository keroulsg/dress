import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Store, CheckCircle, XCircle, Search, Layers, Percent } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface Props {
    ateliers: {
        data: any[];
        links: any[];
        total: number;
    };
    stats: {
        total: number;
        active: number;
        pending_approval: number;
        total_dresses: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function AteliersIndex({ ateliers, stats, filters }: Props) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [editingCommissionId, setEditingCommissionId] = useState<number | null>(null);
    const [newCommission, setNewCommission] = useState<number>(0.15);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/ateliers', { search: searchTerm, status: filters.status }, { preserveState: true });
    };

    const toggleStatus = (id: number) => {
        router.patch(`/admin/ateliers/${id}/toggle-status`);
    };

    const handleSaveCommission = (id: number) => {
        router.put(
            `/admin/ateliers/${id}/commission`,
            { commission_rate: newCommission },
            {
                onSuccess: () => setEditingCommissionId(null),
            }
        );
    };

    return (
        <AdminLayout>
            <Head title={tr('إدارة الأتيليهات | Maison Admin', 'Ateliers Management | Maison Admin')} />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                    {tr('إدارة الأتيليهات ودور الأزياء', 'Ateliers & Fashion Houses Management')}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {tr(
                        'متابعة التراخيص التجارية، نسب العمولة، وتفعيل وتعطيل متاجر الشركاء في المنصة',
                        'Manage business licenses, commission rates, and partner store activation'
                    )}
                </p>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('إجمالي الأتيليهات', 'Total Ateliers')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <Store className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.total}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('أتيليه ومصمم مسجل', 'Registered ateliers and designers')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('الأتيليهات النشطة', 'Active Ateliers')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.active}</p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                        {tr('متاح للاستئجار بالمتجر العام', 'Available in storefront catalog')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('قيد المراجعة والاعتماد', 'Pending Review')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.pending_approval}</p>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 block">
                        {tr('بانتظار الموافقة على الترخيص', 'Awaiting license approval')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('معروضات الفساتين', 'Catalog Dresses')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <Layers className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.total_dresses}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('فستان منشور في الكتالوج', 'Published dresses in catalog')}
                    </span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 mb-6 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3 h-4 w-4 text-stone-400`} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={tr('بحث باسم الأتيليه أو رقم الترخيص أو المالك…', 'Search by atelier, license or owner…')}
                            className={`w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 ${
                                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                            } py-2.5 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:border-amber-600 focus:bg-white dark:focus:bg-stone-900 focus:outline-none transition-colors`}
                        />
                    </div>
                </form>
            </div>

            {/* Ateliers Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
                <div className="overflow-x-auto">
                    <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                        <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3.5">{tr('الأتيليه والمالك', 'Atelier & Owner')}</th>
                                <th className="px-5 py-3.5">{tr('رقم السجل / الترخيص', 'License / Registration')}</th>
                                <th className="px-5 py-3.5">{tr('عدد الفساتين', 'Dresses Count')}</th>
                                <th className="px-5 py-3.5">{tr('نسبة العمولة (Commission)', 'Commission Rate')}</th>
                                <th className="px-5 py-3.5">{tr('حالة المتجر', 'Store Status')}</th>
                                <th className="px-5 py-3.5 text-center">{tr('الإجراء', 'Action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                            {ateliers.data.length > 0 ? (
                                ateliers.data.map((atelier) => (
                                    <tr key={atelier.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{atelier.business_name}</p>
                                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                                                {tr('المالك:', 'Owner:')} {atelier.owner?.name || tr('غير محدد', 'Not set')} ({atelier.owner?.email || '—'})
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 font-mono text-stone-500 dark:text-stone-400">
                                            {atelier.license_number || 'LIC-STANDARD'}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-amber-700 dark:text-amber-400">
                                            {atelier.dresses_count} {tr('فستان', 'Dresses')}
                                        </td>
                                        <td className="px-5 py-4">
                                            {editingCommissionId === atelier.id ? (
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="1"
                                                        defaultValue={atelier.commission_rate}
                                                        onChange={(e) => setNewCommission(parseFloat(e.target.value))}
                                                        className="w-20 rounded border border-amber-600 bg-white dark:bg-stone-800 dark:text-stone-100 px-2 py-1 text-xs text-stone-900"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSaveCommission(atelier.id)}
                                                        className="px-2.5 py-1 bg-amber-600 text-white font-medium rounded text-[11px] hover:bg-amber-700"
                                                    >
                                                        {tr('حفظ', 'Save')}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCommissionId(atelier.id);
                                                        setNewCommission(atelier.commission_rate);
                                                    }}
                                                    className="flex items-center gap-1 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                                                >
                                                    <Percent className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                                    <span className="font-mono font-medium">{(atelier.commission_rate * 100).toFixed(0)}%</span>
                                                    <span className="text-[10px] text-stone-400 hover:underline">({tr('تعديل', 'Edit')})</span>
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                                    atelier.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                }`}
                                            >
                                                {atelier.is_active ? tr('نشط ومعتمد', 'Active & Verified') : tr('معلق / غير نشط', 'Pending / Inactive')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(atelier.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                    atelier.is_active
                                                        ? 'border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100/60'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                }`}
                                            >
                                                {atelier.is_active ? tr('إيقاف مؤقت', 'Suspend') : tr('اعتماد وتفعيل', 'Approve & Activate')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-stone-400 dark:text-stone-500">
                                        {tr('لا توجد أتيليهات مسجلة مطابقة للبحث.', 'No registered ateliers match search criteria.')}
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
