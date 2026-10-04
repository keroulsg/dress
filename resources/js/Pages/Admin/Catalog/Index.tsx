import React, { useState } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatCurrency } from '@/Lib/currency';
import { Layers, Eye, EyeOff, Trash2, Search, Sparkles, Plus, Tag, X, CheckCircle2 } from 'lucide-react';

import { useLanguage } from '@/Contexts/LanguageContext';
import { cn, resolveImageUrl } from '@/Lib/utils';

interface Props {
    dresses: {
        data: any[];
        links: any[];
        total: number;
    };
    categories: any[];
    stats: {
        total: number;
        active: number;
        draft: number;
        hidden: number;
    };
    filters: {
        search?: string;
        status?: string;
        category_id?: string;
    };
}

export default function CatalogIndex({ dresses, categories, stats, filters }: Props) {
    const { t, isRtl } = useLanguage();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        is_active: true as boolean,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/catalog', { search: searchTerm, status: filters.status, category_id: filters.category_id }, { preserveState: true });
    };

    const togglePublish = (id: number) => {
        router.patch(`/admin/catalog/${id}/toggle-publish`);
    };

    const handleDelete = (id: number, title: string) => {
        if (confirm(`تحذير: هل أنت متأكد من حذف الفستان "${title}" نهائياً من الكتالوج العام؟`)) {
            router.delete(`/admin/catalog/${id}`);
        }
    };

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/categories', {
            onSuccess: () => {
                setIsCategoryModalOpen(false);
                reset();
                router.reload();
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="إدارة الكتالوج العام والأقسام | Maison Admin" />

            {/* Page Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-wide">
                        {t('admin.catalog.title')}
                    </h1>
                    <p className="text-sm text-stone-500 mt-1">
                        {t('admin.catalog.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-stone-800 transition-all shadow-sm"
                    >
                        <Plus className="h-4 w-4 text-amber-400" />
                        <span>{t('admin.catalog.add_category_btn')}</span>
                    </button>

                    <Link
                        href="/admin/categories"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:border-amber-500 hover:text-amber-700 transition-all shadow-xs"
                    >
                        <Tag className="h-4 w-4" />
                        <span>{t('nav.admin.categories')}</span>
                    </Link>
                </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3 shadow-xs">
                <Sparkles className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-amber-950">
                    <strong className="font-semibold block mb-0.5">{isRtl ? 'ميزة التوسّع الديناميكي للأقسام والمنتجات:' : 'Dynamic Multi-Category Expansion:'}</strong>
                    {t('admin.catalog.add_category_hint')}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('admin.catalog.total_items')}</span>
                        <Layers className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 mt-2">{stats.total}</p>
                    <span className="text-[11px] text-stone-400 mt-1 block">{isRtl ? 'قطعة مسجلة بالنظام' : 'Units registered in platform'}</span>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('admin.catalog.active_items')}</span>
                        <Eye className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 mt-2">{stats.active}</p>
                    <span className="text-[11px] text-emerald-700 font-medium mt-1 block">{isRtl ? 'مرئي ومتاح للحجز المباشر' : 'Live & Bookable'}</span>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('admin.catalog.hidden_items')}</span>
                        <EyeOff className="h-5 w-5 text-rose-600" />
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 mt-2">{stats.hidden}</p>
                    <span className="text-[11px] text-rose-700 font-medium mt-1 block">{isRtl ? 'محجوب بقرار الإدارة أو الأتيليه' : 'Hidden by Admin or Atelier'}</span>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{isRtl ? 'الأقسام المتاحة' : 'Active Categories'}</span>
                        <Tag className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 mt-2">{categories.length}</p>
                    <span className="text-[11px] text-stone-500 mt-1 block">{isRtl ? 'تصنيف نشط جاهز للبائعات' : 'Categories ready for sellers'}</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 mb-6 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className={cn('absolute top-3 h-4 w-4 text-stone-400', isRtl ? 'right-3' : 'left-3')} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('admin.catalog.search_placeholder')}
                            className={cn(
                                'w-full rounded-xl border border-stone-200 bg-stone-50 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none transition-colors',
                                isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4',
                            )}
                        />
                    </div>
                </form>
            </div>

            {/* Catalog Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3.5 text-start">{t('admin.catalog.col_dress')}</th>
                                <th className="px-5 py-3.5 text-start">{t('admin.catalog.col_atelier')}</th>
                                <th className="px-5 py-3.5 text-start">{t('admin.catalog.col_category')}</th>
                                <th className="px-5 py-3.5 text-start">{t('admin.catalog.col_daily_rate')}</th>
                                <th className="px-5 py-3.5 text-start">{t('admin.catalog.col_status')}</th>
                                <th className="px-5 py-3.5 text-center">{t('admin.catalog.col_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-700">
                            {dresses.data.length > 0 ? (
                                dresses.data.map((dress) => (
                                    <tr key={dress.id} className="hover:bg-stone-50/70 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-stone-100 border border-stone-200 shadow-2xs">
                                                    <img
                                                        src={resolveImageUrl(dress.primary_image?.image_path) || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200'}
                                                        alt={dress.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-stone-900 text-sm line-clamp-1">{dress.title}</p>
                                                    <p className="text-[11px] text-stone-400 font-mono mt-0.5">#{dress.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-medium text-stone-900">
                                                {dress.atelier?.business_name || 'أتيليه ميزون'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-md bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700 border border-stone-200">
                                                {dress.category?.name || dress.category?.name_ar || 'سهرة وهوكوتور'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-stone-900 font-mono">
                                            {formatCurrency(dress.rental_price_per_day, 'EGP')}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                                    dress.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                                                }`}
                                            >
                                                {dress.status === 'active' ? 'معروض نشط' : 'مخفي / مسودة'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => togglePublish(dress.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                        dress.status === 'active'
                                                            ? 'border border-stone-300 text-stone-700 hover:bg-stone-100'
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                                                    }`}
                                                >
                                                    {dress.status === 'active' ? 'إخفاء من المتجر' : 'تنشيط ونشر'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(dress.id, dress.title)}
                                                    className="p-1 rounded text-stone-400 hover:text-rose-600 transition-colors"
                                                    title="حذف من الكتالوج"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                                        لا توجد قطع مسجلة في الكتالوج حالياً.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Direct Add Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <div>
                                <h3 className="font-serif text-xl font-bold text-stone-900">
                                    {t('admin.catalog.modal_title')}
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    {t('admin.catalog.modal_desc')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="p-1 text-stone-400 hover:text-stone-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1">
                                    {t('admin.catalog.cat_name_ar')}
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={isRtl ? 'مثال: حقائب يد وإكسسوارات فاخرة (Luxury Bags)' : 'e.g. Luxury Handbags & Clutches'}
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none"
                                    required
                                />
                                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1">{t('admin.catalog.cat_name_en')}</label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="bags-accessories"
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1">{t('admin.catalog.cat_desc')}</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    placeholder={isRtl ? 'تشكيلة الحقائب والإكسسوارات المصممة لتكمل إطلالة الفستان...' : 'Curated collection of luxury designer bags and accessories...'}
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-amber-500"
                                />
                                <label htmlFor="is_active" className="text-xs font-semibold text-stone-800 cursor-pointer">
                                    {isRtl ? 'تفعيل القسم وإتاحته فوراً للأتيليهات والمتجر العام' : 'Activate category immediately for all ateliers'}
                                </label>
                            </div>

                            <div className="border-t border-stone-100 pt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-bold text-amber-300 hover:bg-stone-800 transition-colors shadow-sm"
                                >
                                    {processing ? (isRtl ? 'جاري الحفظ…' : 'Saving…') : t('admin.catalog.save_category')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
