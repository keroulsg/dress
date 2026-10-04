import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import WishlistDrawer from '@/Modules/Storefront/WishlistDrawer';
import { formatCurrency } from '@/Lib/currency';
import { resolveImageUrl } from '@/Lib/utils';
import { useLanguage } from '@/Contexts/LanguageContext';
import {
    LayoutGrid,
    Columns2,
    Filter,
    X,
    Sparkles,
    Calendar,
    ArrowUpDown,
    Check,
    RotateCcw,
    ShieldCheck,
    MapPin,
} from 'lucide-react';
import { Button } from '@/Components/UI/Button';

export default function Catalog({ dresses, filters, categories = [], governorates = [] }: any) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'editorial' | 'grid'>('grid');
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        router.get('/catalog', { ...filters, [name]: value }, { preserveState: true, replace: true });
    };

    const handleCategoryClick = (categorySlug: string) => {
        router.get('/catalog', { ...filters, category: categorySlug }, { preserveState: true, replace: true });
    };

    const handleModeClick = (mode: string) => {
        router.get('/catalog', { ...filters, mode }, { preserveState: true, replace: true });
    };

    const clearAllFilters = () => {
        router.get('/catalog', {}, { preserveState: true, replace: true });
    };

    const activeFilterCount = [
        filters.category,
        filters.governorate,
        filters.city,
        filters.mode,
        filters.start_date,
        filters.end_date,
        filters.min_price,
        filters.max_price,
    ].filter(Boolean).length;

    const categoryChips = [
        { slug: '', labelAr: 'المجموعة الكاملة (الكل)', labelEn: 'All Collection', icon: '✨' },
        { slug: 'wedding-evening-gowns', labelAr: 'فساتين زفاف وسهرة', labelEn: 'Gowns & Wedding', icon: '👗' },
        { slug: 'luxury-abayas-kaftans', labelAr: 'عبايات وقفاطين', labelEn: 'Abayas & Kaftans', icon: '✨' },
        { slug: 'bridal-jewelry-accessories', labelAr: 'مجوهرات وإكسسوارات', labelEn: 'Bridal Jewelry', icon: '💎' },
        { slug: 'occasion-bags-shoes', labelAr: 'حقائب وأحذية', labelEn: 'Bags & Footwear', icon: '👠' },
        { slug: 'handmade-designer-brands', labelAr: 'كوتور وتفصيل يدوي', labelEn: 'Handmade Couture', icon: '🪡' },
    ];

    const filterFormContent = (
        <div className="space-y-6">
            {/* Rental Dates */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <span>{tr('تواريخ المناسبة والحجز', 'Event & Rental Dates')}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    <div>
                        <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
                            {tr('تاريخ الاستلام والبدء', 'Start Date')}
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
                        <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
                            {tr('تاريخ الإعادة والانتهاء', 'End Date')}
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

            {/* Category Dropdown */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
                    {tr('القسم والتخصص', 'Category')}
                </h4>
                <select
                    name="category"
                    value={filters.category || ''}
                    onChange={handleFilterChange}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                >
                    <option value="">{tr('جميع الأقسام (All Categories)', 'All Categories')}</option>
                    {categoryChips
                        .filter((c) => c.slug)
                        .map((c) => (
                            <option key={c.slug} value={c.slug}>
                                {isRtl ? c.labelAr : c.labelEn}
                            </option>
                        ))}
                </select>
            </div>

            {/* Governorate Filter */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-amber-600" />
                    <span>{tr('المحافظة وموقع القطعة', 'Governorate & Location')}</span>
                </h4>
                <select
                    name="governorate"
                    value={filters.governorate || ''}
                    onChange={handleFilterChange}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                >
                    <option value="">{tr('جميع المحافظات (كل مصر)', 'All Governorates (All Egypt)')}</option>
                    {governorates.map((gov: any) => (
                        <option key={gov.value} value={gov.value}>
                            {isRtl ? gov.name_ar : gov.name_en}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sort Order */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-1.5">
                    <ArrowUpDown className="h-4 w-4 text-amber-600" />
                    <span>{tr('ترتيب النتائج', 'Sort By')}</span>
                </h4>
                <select
                    name="sort"
                    defaultValue={filters.sort || 'recommended'}
                    onChange={handleFilterChange}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                >
                    <option value="recommended">{tr('الموصى به (الأعلى تقييماً)', 'Recommended (Top Rated)')}</option>
                    <option value="newest">{tr('الأحدث وصولاً (Newest Arrivals)', 'Newest Arrivals')}</option>
                    <option value="price_asc">{tr('السعر: من الأقل للأعلى', 'Price: Low to High')}</option>
                    <option value="price_desc">{tr('السعر: من الأعلى للأقل', 'Price: High to Low')}</option>
                </select>
            </div>

            {/* Reset Filter Button */}
            {activeFilterCount > 0 && (
                <button
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{tr('إلغاء كافة الفلاتر والبحث مجدداً', 'Reset All Filters')}</span>
                </button>
            )}
        </div>
    );

    return (
        <StorefrontLayout>
            <Head title={tr('كتالوج الموضة والأزياء الراقية | Maison Rentale', 'Haute Couture Catalog | Maison Rentale')} />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Header Banner */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/60 mb-2">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>{tr('مملكة الأناقة والمناسبات في مصر', 'Egypt Occasions Kingdom')}</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                                {tr('كتالوج الأزياء والتصاميم الراقية', 'Haute Couture & Occasion Catalog')}
                            </h1>
                            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-3xl leading-relaxed">
                                {tr(
                                    'استأجري لمناسبتك أو اشتري مباشرة من نخبة الأتيليهات مع ضمان فوري لاسترداد التأمين خلال 24 ساعة.',
                                    'Rent for your special occasion or buy directly with guaranteed 24h deposit return protection.'
                                )}
                            </p>
                        </div>

                        {/* Mobile Filter Toggle Button */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setMobileFilterOpen(true)}
                                className="text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                            >
                                <Filter className="h-4 w-4 text-amber-600" />
                                <span>{tr('تصفية وفرز', 'Filters & Sort')}</span>
                                {activeFilterCount > 0 && (
                                    <span className="h-5 w-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Mode Pills (All / Rent / Sale) */}
                    <div className="flex flex-wrap items-center gap-2 mt-5">
                        <button
                            type="button"
                            onClick={() => handleModeClick('')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                !filters.mode
                                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                            }`}
                        >
                            {tr('جميع المعروضات (All)', 'All Items')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleModeClick('rent')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                filters.mode === 'rent'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                            }`}
                        >
                            {tr('متاح للإيجار للمناسبات', 'Rent for Occasions')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleModeClick('sale')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                filters.mode === 'sale'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                            }`}
                        >
                            {tr('شراء وتملك فوري', 'Direct Buy')}
                        </button>
                    </div>

                    {/* Horizontal Category Chips Bar */}
                    <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {categoryChips.map((chip) => {
                            const isSelected = (!filters.category && chip.slug === '') || filters.category === chip.slug;
                            return (
                                <button
                                    key={chip.slug}
                                    type="button"
                                    onClick={() => handleCategoryClick(chip.slug)}
                                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                        isSelected
                                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-xs'
                                            : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-400'
                                    }`}
                                >
                                    <span>{chip.icon}</span>
                                    <span>{isRtl ? chip.labelAr : chip.labelEn}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs">
                            <div className="flex items-center justify-between pb-3 mb-5 border-b border-stone-100 dark:border-stone-800">
                                <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
                                    <Filter className="h-4 w-4 text-amber-600" />
                                    <span>{tr('تصفية المعروضات', 'Filters')}</span>
                                </div>
                                {activeFilterCount > 0 && (
                                    <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                                        {activeFilterCount} {tr('محدد', 'active')}
                                    </span>
                                )}
                            </div>
                            {filterFormContent}
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 w-full">
                        {/* Results Count & View Toggle */}
                        <div className="flex justify-between items-center mb-6 bg-white dark:bg-stone-900 p-3 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                            <p className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300">
                                {tr(`عرض ${dresses.data ? dresses.data.length : 0} من إجمالي ${dresses.total || 0} قطعة متاحة`, `Showing ${dresses.data ? dresses.data.length : 0} of ${dresses.total || 0} available pieces`)}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('editorial')}
                                    className={`p-1.5 rounded-xl border transition-colors ${
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
                                    className={`p-1.5 rounded-xl border transition-colors ${
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

                        {/* Dresses Grid */}
                        {dresses.data && dresses.data.length > 0 ? (
                            <div
                                className={`grid gap-4 sm:gap-6 ${
                                    viewMode === 'editorial'
                                        ? 'grid-cols-1 md:grid-cols-2'
                                        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                                }`}
                            >
                                {dresses.data.map((dress: any) => (
                                    <Link
                                        href={`/dresses/${dress.slug}`}
                                        key={dress.id}
                                        className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 sm:p-3.5 shadow-xs hover:shadow-xl hover:border-amber-400/60 transition-all flex flex-col justify-between"
                                    >
                                        <div className="aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-stone-800 rounded-xl mb-3 relative shadow-xs">
                                            <img
                                                src={
                                                    resolveImageUrl(dress.images?.[0]?.image_path || dress.primary_image?.image_path) ||
                                                    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'
                                                }
                                                alt={dress.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                loading="lazy"
                                            />
                                            {/* Category Tag */}
                                            <span
                                                className={`absolute top-2.5 ${
                                                    isRtl ? 'right-2.5' : 'left-2.5'
                                                } rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-amber-200 uppercase backdrop-blur`}
                                            >
                                                {isRtl ? dress.category?.name_ar || dress.category?.name || 'هوت كوتور' : dress.category?.name_en || dress.category?.name || 'Haute Couture'}
                                            </span>

                                            {/* Mode Badges */}
                                            {dress.allows_sale && (
                                                <span
                                                    className={`absolute top-2.5 ${
                                                        isRtl ? 'left-2.5' : 'right-2.5'
                                                    } rounded-md bg-amber-600/95 text-white px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur shadow-xs`}
                                                >
                                                    {tr('شراء فوري', 'For Sale')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">
                                                    {dress.atelier?.business_name || dress.atelier?.name || 'Maison Atelier'}
                                                </p>
                                                {(dress.city || dress.governorate || dress.atelier?.city || dress.atelier?.governorate) && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/40 shrink-0">
                                                        <span>📍</span>
                                                        <span>
                                                            {[
                                                                dress.city || dress.atelier?.city,
                                                                dress.governorate || dress.atelier?.governorate,
                                                            ].filter(Boolean).join('، ')}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                {dress.title}
                                            </h3>

                                            <div className="pt-1 flex items-baseline justify-between gap-1 flex-wrap border-t border-stone-100 dark:border-stone-800">
                                                {dress.allows_rent !== false && (
                                                    <div className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
                                                        {formatCurrency(dress.rental_price_per_day, 'EGP')}{' '}
                                                        <span className="text-[10px] font-normal text-stone-400 font-sans">/{tr('يوم', 'day')}</span>
                                                    </div>
                                                )}
                                                {dress.allows_sale && (
                                                    <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 font-mono">
                                                        {tr('شراء:', 'Buy:')} {formatCurrency(dress.original_retail_value || (parseFloat(dress.rental_price_per_day || '1500') * 8).toString(), 'EGP')}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Security Deposit Note */}
                                            <div className="pt-1 text-[10px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    {tr('تأمين 25% مسترد', '25% Refundable Deposit')}
                                                </span>
                                                <span className="text-amber-500 font-bold">
                                                    ★ {Number(dress.rating_average || 5.0).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center text-stone-400 dark:text-stone-500 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                                <Sparkles className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                                    {tr('لا توجد قطع مطابقة لمعايير البحث الحالية.', 'No items match the current search criteria.')}
                                </h3>
                                <p className="text-xs max-w-md mx-auto mb-4">
                                    {tr(
                                        'يرجى تغيير التواريخ المحددة أو إزالة فلتر القسم لتصفح باقي المجموعة الفاخرة.',
                                        'Please adjust your selected dates or clear category filters to view other available pieces.'
                                    )}
                                </p>
                                <Button type="button" variant="outline" size="sm" onClick={clearAllFilters} className="text-xs font-semibold">
                                    {tr('إعادة ضبط الكتالوج وعرض كل القطع', 'Reset Filters & Show All')}
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Slide-out Modal */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileFilterOpen(false)}
                    />
                    <div className="relative ml-auto h-full w-full max-w-xs bg-white dark:bg-stone-900 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-6">
                                <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-stone-100">
                                    <Filter className="h-4 w-4 text-amber-600" />
                                    <span>{tr('تصفية المعروضات', 'Filters')}</span>
                                </div>
                                <button
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            {filterFormContent}
                        </div>
                        <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                            <Button
                                type="button"
                                variant="champagne"
                                size="sm"
                                onClick={() => setMobileFilterOpen(false)}
                                className="w-full text-xs font-bold"
                            >
                                {tr('تطبيق وعرض النتائج', 'Apply & View Results')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
        </StorefrontLayout>
    );
}
