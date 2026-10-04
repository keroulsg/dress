import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import WishlistDrawer from '@/Modules/Storefront/WishlistDrawer';
import { Sparkles, Calendar, Search } from 'lucide-react';
import { formatCurrency } from '@/Lib/currency';
import { resolveImageUrl } from '@/Lib/utils';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Home({ trending = [], featuredAteliers = [] }: any) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    return (
        <StorefrontLayout>
            <Head
                title={tr(
                    'Maison Rentale | منصة تأجير فساتين الهوت كوتور الفاخرة',
                    'Maison Rentale | Luxury Haute Couture Rental Platform'
                )}
            />

            {/* Hero Section */}
            <section className="relative h-[72vh] min-h-[500px] bg-stone-950 flex items-center justify-center text-stone-100 overflow-hidden">
                <div className="absolute inset-0 bg-black/55 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=1920"
                    alt="Luxury Haute Couture Gowns"
                    className="absolute inset-0 w-full h-full object-cover opacity-70 scale-105 transition-transform duration-1000"
                />
                <div className="relative z-20 text-center max-w-3xl px-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/50 px-4 py-1.5 text-xs text-amber-200 backdrop-blur mb-6">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>
                            {tr(
                                'مملكة الأناقة والمناسبات — فساتين، عبايات، مجوهرات، وإكسسوارات كوتور',
                                'Fashion & Occasions Kingdom — Gowns, Abayas, Jewelry & Couture'
                            )}
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif mb-6 leading-tight font-normal text-white">
                        {tr('تألقي في كل مناسبة', 'Radiate Elegance in Every Occasion')}
                    </h1>
                    <p className="text-base sm:text-lg mb-8 text-stone-200 max-w-2xl mx-auto leading-relaxed">
                        {tr(
                            'تأجير للمناسبات الراقية أو شراء وتملك فوري من نخبة الأتيليهات والمصممين، مع ضمان استرداد التأمين خلال 24 ساعة.',
                            'Rent for gala occasions or buy directly from premier ateliers with guaranteed 24h deposit refund protection.'
                        )}
                    </p>

                    {/* Quick Search */}
                    <div className="bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center shadow-2xl backdrop-blur max-w-2xl mx-auto border border-stone-200/50 dark:border-stone-700/50">
                        <div className="flex items-center gap-2 w-full md:w-auto flex-1 px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl">
                            <Calendar className="h-4 w-4 text-stone-400" />
                            <input
                                type="date"
                                className="border-0 bg-transparent text-xs w-full focus:ring-0 text-stone-900 dark:text-stone-100"
                                aria-label="Event Date"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto flex-1 px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl">
                            <select
                                className="border-0 bg-transparent text-xs w-full focus:ring-0 text-stone-900 dark:text-stone-100"
                                aria-label="Category Selection"
                            >
                                <option value="" className="dark:bg-stone-800">
                                    {tr('جميع الأقسام (All Categories)', 'All Categories')}
                                </option>
                                <option value="wedding-evening-gowns" className="dark:bg-stone-800">
                                    {tr('فساتين زفاف وسهرة (Gowns)', 'Wedding & Evening Gowns')}
                                </option>
                                <option value="luxury-abayas-kaftans" className="dark:bg-stone-800">
                                    {tr('عبايات وقفاطين فاخرة (Abayas)', 'Luxury Abayas & Kaftans')}
                                </option>
                                <option value="bridal-jewelry-accessories" className="dark:bg-stone-800">
                                    {tr('مجوهرات وإكسسوارات زفاف (Jewelry)', 'Bridal Jewelry & Accessories')}
                                </option>
                                <option value="occasion-bags-shoes" className="dark:bg-stone-800">
                                    {tr('حقائب وأحذية مناسبات (Bags & Shoes)', 'Occasion Bags & Shoes')}
                                </option>
                                <option value="handmade-designer-brands" className="dark:bg-stone-800">
                                    {tr('براندات وتصاميم يدوية (Designer Brands)', 'Handmade Designer Brands')}
                                </option>
                            </select>
                        </div>
                        <Link
                            href="/catalog"
                            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-stone-900 dark:bg-amber-600 text-amber-200 dark:text-white px-7 py-3 rounded-xl uppercase tracking-wider text-xs font-semibold hover:bg-black dark:hover:bg-amber-700 transition shadow"
                        >
                            <Search className="h-3.5 w-3.5" />
                            <span>{tr('استكشفي الكتالوج', 'Explore Catalog')}</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Ecosystem Category Grid */}
            <section className="py-12 bg-stone-50 dark:bg-stone-900/30 border-b border-stone-200 dark:border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.2em] text-rose-600 dark:text-rose-400 uppercase mb-1">
                                {tr('عالم متكامل للمناسبات', 'Occasions Universe')}
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 dark:text-stone-100">
                                {tr('تسوقي واستأجري حسب القسم', 'Browse & Rent by Specialty')}
                            </h2>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <Link href="/catalog?mode=rent" className="px-3.5 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 hover:border-stone-900 dark:hover:border-white transition-colors">
                                {tr('الإيجار للمناسبات', 'Rent for Events')}
                            </Link>
                            <Link href="/catalog?mode=sale" className="px-3.5 py-1.5 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 transition-colors">
                                {tr('شراء وتملك فوري', 'Direct Buy')}
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4">
                        {[
                            { slug: 'wedding-evening-gowns', nameAr: 'فساتين سهرة وزفاف', nameEn: 'Wedding & Evening', icon: '👗' },
                            { slug: 'luxury-abayas-kaftans', nameAr: 'عبايات وقفاطين فاخرة', nameEn: 'Abayas & Kaftans', icon: '✨' },
                            { slug: 'bridal-jewelry-accessories', nameAr: 'مجوهرات وتيجان الزفاف', nameEn: 'Bridal Jewelry', icon: '💎' },
                            { slug: 'occasion-bags-shoes', nameAr: 'حقائب وأحذية مناسبات', nameEn: 'Bags & Footwear', icon: '👠' },
                            { slug: 'handmade-designer-brands', nameAr: 'براندات كوتور يدوية', nameEn: 'Handmade Couture', icon: '🪡' },
                        ].map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/catalog?category=${cat.slug}`}
                                className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 hover:shadow-md transition-all text-center flex flex-col items-center"
                            >
                                <span className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                                <h3 className="font-medium text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                    {isRtl ? cat.nameAr : cat.nameEn}
                                </h3>
                                <span className="text-[10px] text-stone-400 mt-1">
                                    {tr('تصفحي القطع ➔', 'Browse ➔')}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Collection Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h3 className="text-xs font-bold tracking-[0.2em] text-rose-600 dark:text-rose-400 uppercase mb-1.5">
                            {tr('مختارات هذا الأسبوع', 'Curated This Week')}
                        </h3>
                        <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 dark:text-stone-100">
                            {tr('الأكثر طلباً (Trending Now)', 'Trending Couture Gowns')}
                        </h2>
                    </div>
                    <Link
                        href="/catalog"
                        className="text-sm text-stone-900 dark:text-stone-300 border-b border-stone-400 pb-0.5 hover:border-stone-900 dark:hover:border-stone-100 hover:text-amber-700 dark:hover:text-amber-400 transition-all"
                    >
                        {tr('عرض الكل ➔', 'View All ➔')}
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {trending.map((dress: any) => (
                        <Link href={`/dresses/${dress.slug}`} key={dress.id} className="group cursor-pointer">
                            <div className="aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-stone-800 rounded-2xl mb-3.5 relative shadow-sm">
                                <img
                                    src={
                                        resolveImageUrl(dress.primary_image?.image_path || dress.images?.[0]?.image_path) ||
                                        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800'
                                    }
                                    alt={dress.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <span
                                    className={`absolute top-2.5 ${
                                        isRtl ? 'right-2.5' : 'left-2.5'
                                    } rounded-lg bg-black/75 px-2.5 py-0.5 text-[10px] font-semibold text-amber-200 uppercase backdrop-blur`}
                                >
                                    {isRtl ? dress.category?.name_ar || 'هوت كوتور' : dress.category?.name_en || 'Haute Couture'}
                                </span>
                            </div>
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <p className="text-[11px] text-stone-400 uppercase tracking-wider mb-0.5">
                                        {dress.atelier?.business_name || dress.atelier?.name || 'Maison Atelier'}
                                    </p>
                                    <h4 className="font-serif text-base text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        {dress.title}
                                    </h4>
                                </div>
                                <div className={isRtl ? 'text-left shrink-0' : 'text-right shrink-0'}>
                                    <p className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                                        {formatCurrency(dress.rental_price_per_day, 'EGP')}
                                    </p>
                                    <span className="text-[10px] text-stone-400">/{tr('يوم', 'day')}</span>
                                </div>
                            </div>
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-500">
                                <span>★</span>
                                <span className="font-semibold">{Number(dress.rating_average || 5.0).toFixed(1)}</span>
                                <span className="text-stone-400 text-[10px]">
                                    ({dress.rating_count || 0} {tr('تقييم', 'reviews')})
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Atelier Spotlight */}
            <section className="py-16 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">
                            {tr('أتيليهات مصممة بعناية', 'Handcrafted Ateliers')}
                        </p>
                        <h2 className="text-3xl font-serif text-stone-900 dark:text-stone-100">
                            {tr('شركاؤنا من دور الأزياء والمصممين', 'Our Partner Ateliers & Designers')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(featuredAteliers || []).map((atelier: any) => {
                            const atelierName = atelier.business_name || atelier.name || 'Maison Atelier';
                            return (
                                <div
                                    key={atelier.id}
                                    className="bg-white dark:bg-stone-900 p-6 rounded-2xl text-center shadow-sm border border-stone-200 dark:border-stone-800"
                                >
                                    <div className="w-16 h-16 bg-stone-900 dark:bg-stone-800 rounded-full mx-auto mb-3.5 flex items-center justify-center text-amber-300 text-xl font-serif">
                                        {atelierName.charAt(0).toUpperCase()}
                                    </div>
                                    <h4 className="text-base font-serif font-medium text-stone-900 dark:text-stone-100 mb-1">
                                        {atelierName}
                                    </h4>
                                    <p className="text-stone-400 text-xs mb-4">
                                        ★ {Number(atelier.rating_average || 5.0).toFixed(1)} {tr('تقييم معتمد', 'Verified Rating')}
                                    </p>
                                    <Link
                                        href={`/catalog?atelier=${atelier.id}`}
                                        className="inline-block text-xs font-semibold border border-stone-300 dark:border-stone-700 px-4 py-2 rounded-xl text-stone-900 dark:text-stone-200 hover:bg-stone-900 hover:text-white dark:hover:bg-amber-600 transition-colors"
                                    >
                                        {tr('تصفح المجموعة', 'View Collection')}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
        </StorefrontLayout>
    );
}
