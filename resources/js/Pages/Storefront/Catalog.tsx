import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import WishlistDrawer from '@/Modules/Storefront/WishlistDrawer';
import { formatCurrency } from '@/Lib/currency';
import { resolveImageUrl } from '@/Lib/utils';
import { useLanguage } from '@/Contexts/LanguageContext';
import { LayoutGrid, Columns2, Filter } from 'lucide-react';

export default function Catalog({ dresses, filters, categories = [] }: any) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'editorial' | 'grid'>('grid');

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        router.get('/catalog', { ...filters, [name]: value }, { preserveState: true, replace: true });
    };

    return (
        <StorefrontLayout>
            <Head title={tr('كتالوج الفساتين الفاخرة | Maison Rentale', 'Luxury Dresses Catalog | Maison Rentale')} />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header Banner */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
                        {tr('كتالوج الموضة والأزياء الراقية', 'Luxury Fashion & Occasions Catalog')}
                    </h1>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                        {tr(
                            'اكتشفي أرقى فساتين السهرة، الزفاف، العبايات، والمجوهرات المتاحة للإيجار أو الشراء والتملك المباشر',
                            'Explore prestigious evening gowns, abayas, jewelry and footwear available for rental or direct purchase'
                        )}
                    </p>

                    {/* Mode & Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => router.get('/catalog', { ...filters, mode: '' }, { preserveState: true, replace: true })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                !filters.mode
                                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                            }`}
                        >
                            {tr('جميع القطع (All)', 'All Items')}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.get('/catalog', { ...filters, mode: 'rent' }, { preserveState: true, replace: true })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                filters.mode === 'rent'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                            }`}
                        >
                            {tr('متاح للإيجار للمناسبات', 'Rent for Occasions')}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.get('/catalog', { ...filters, mode: 'sale' }, { preserveState: true, replace: true })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                filters.mode === 'sale'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                            }`}
                        >
                            {tr('متاح للشراء والتملك الفوري', 'Direct Buy')}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 shrink-0 space-y-6">
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs space-y-5">
                            <div>
                                <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-1.5">
                                    <Filter className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                                    <span>{tr('تواريخ الحجز', 'Rental Dates')}</span>
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                                            {tr('تاريخ البدء', 'Start Date')}
                                        </label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            defaultValue={filters.start_date || ''}
                                            onChange={handleFilterChange}
                                            className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                                            {tr('تاريخ الانتهاء', 'End Date')}
                                        </label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            defaultValue={filters.end_date || ''}
                                            onChange={handleFilterChange}
                                            className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
                                    {tr('القسم / التصنيف', 'Category')}
                                </h3>
                                <select
                                    name="category"
                                    value={filters.category || ''}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                                >
                                    <option value="">{tr('جميع الأقسام (All Categories)', 'All Categories')}</option>
                                    {categories.map((c: any) => (
                                        <option key={c.id} value={c.slug}>
                                            {isRtl ? c.name_ar || c.name : c.name_en || c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <h3 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
                                    {tr('ترتيب النتائج', 'Sort By')}
                                </h3>
                                <select
                                    name="sort"
                                    defaultValue={filters.sort || 'recommended'}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                                >
                                    <option value="recommended">{tr('الموصى به (Recommended)', 'Recommended')}</option>
                                    <option value="newest">{tr('الأحدث وصولاً (Newest)', 'Newest Arrivals')}</option>
                                    <option value="price_asc">{tr('السعر: من الأقل للأعلى', 'Price: Low to High')}</option>
                                    <option value="price_desc">{tr('السعر: من الأعلى للأقل', 'Price: High to Low')}</option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                {tr(`تم العثور على ${dresses.total || 0} قطعة`, `${dresses.total || 0} pieces found`)}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('editorial')}
                                    className={`p-1.5 rounded-lg border transition-colors ${
                                        viewMode === 'editorial'
                                            ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                                            : 'border-stone-200 dark:border-stone-700 text-stone-400'
                                    }`}
                                    title={tr('عرض تحريري', 'Editorial View')}
                                >
                                    <Columns2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-lg border transition-colors ${
                                        viewMode === 'grid'
                                            ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                                            : 'border-stone-200 dark:border-stone-700 text-stone-400'
                                    }`}
                                    title={tr('عرض شبكي', 'Grid View')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {dresses.data && dresses.data.length > 0 ? (
                            <div
                                className={`grid gap-6 ${
                                    viewMode === 'editorial'
                                        ? 'grid-cols-1 md:grid-cols-2'
                                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                }`}
                            >
                                {dresses.data.map((dress: any) => (
                                    <Link
                                        href={`/dresses/${dress.slug}`}
                                        key={dress.id}
                                        className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div className="aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-stone-800 rounded-xl mb-3 relative">
                                            <img
                                                src={
                                                    resolveImageUrl(dress.images?.[0]?.image_path || dress.primary_image?.image_path) ||
                                                    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'
                                                }
                                                alt={dress.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <span
                                                className={`absolute top-2.5 ${
                                                    isRtl ? 'right-2.5' : 'left-2.5'
                                                } rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-amber-200 uppercase backdrop-blur`}
                                            >
                                                {isRtl ? dress.category?.name_ar || 'هوت كوتور' : dress.category?.name_en || 'Haute Couture'}
                                            </span>
                                            {dress.allows_sale && (
                                                <span
                                                    className={`absolute top-2.5 ${
                                                        isRtl ? 'left-2.5' : 'right-2.5'
                                                    } rounded-md bg-amber-600/90 text-white px-2 py-0.5 text-[10px] font-semibold uppercase backdrop-blur`}
                                                >
                                                    {tr('متاح للشراء', 'For Sale')}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-0.5">
                                                {dress.atelier?.business_name || dress.atelier?.name || 'Maison Atelier'}
                                            </p>
                                            <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                {dress.title}
                                            </h4>
                                            <div className="mt-1 flex items-baseline justify-between gap-1 flex-wrap">
                                                {dress.allows_rent !== false && (
                                                    <p className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                                                        {formatCurrency(dress.rental_price_per_day, 'EGP')}{' '}
                                                        <span className="text-xs font-normal text-stone-400">/{tr('يوم', 'day')}</span>
                                                    </p>
                                                )}
                                                {dress.allows_sale && dress.original_retail_value && (
                                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                                                        {tr('شراء:', 'Buy:')} {formatCurrency(dress.original_retail_value, 'EGP')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center text-stone-400 dark:text-stone-500 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                                <p className="font-serif text-lg text-stone-900 dark:text-stone-100">
                                    {tr('لا توجد فساتين مطابقة للبحث المحدد.', 'No dresses match the selected filter.')}
                                </p>
                                <p className="text-xs mt-1">
                                    {tr('يرجى تجربة تواريخ أخرى أو اختيار تصنيف مختلف.', 'Please try different dates or choose another category.')}
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
        </StorefrontLayout>
    );
}
