import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import WishlistDrawer from '@/Modules/Storefront/WishlistDrawer';
import {
    Sparkles,
    Calendar,
    Search,
    CreditCard,
    Store,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Truck,
    RotateCcw,
    Award,
    HeartHandshake,
} from 'lucide-react';
import { formatCurrency } from '@/Lib/currency';
import { resolveImageUrl } from '@/Lib/utils';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Home({ trending = [], featuredAteliers = [] }: any) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [searchDate, setSearchDate] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (searchCategory) params.category = searchCategory;
        if (searchDate) params.start_date = searchDate;
        const queryString = new URLSearchParams(params).toString();
        router.visit(queryString ? `/catalog?${queryString}` : '/catalog');
    };

    return (
        <StorefrontLayout>
            <Head
                title={tr(
                    'Maison Rentale | منصة تأجير فساتين الهوت كوتور الفاخرة',
                    'Maison Rentale | Luxury Haute Couture Rental Platform'
                )}
            />

            {/* Hero Section */}
            <section className="relative min-h-[580px] lg:h-[78vh] bg-stone-950 flex items-center justify-center text-stone-100 overflow-hidden py-16 sm:py-20">
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-black/60 to-black/40 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=1920"
                    alt="Luxury Haute Couture Gowns"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000"
                />
                <div className="relative z-20 text-center max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/60 px-4 py-1.5 text-xs text-amber-200 backdrop-blur mb-6 shadow-lg">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                        <span className="font-medium">
                            {tr(
                                'مملكة الأناقة والمناسبات — فساتين، عبايات، مجوهرات، وإكسسوارات كوتور',
                                'Fashion & Occasions Kingdom — Gowns, Abayas, Jewelry & Couture'
                            )}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-6 leading-[1.15] font-bold text-white tracking-tight">
                        {tr('تألقي في كل مناسبة', 'Radiate Elegance in Every Occasion')}
                    </h1>

                    <p className="text-sm sm:text-base md:text-lg mb-8 text-stone-200 max-w-2xl mx-auto leading-relaxed font-light">
                        {tr(
                            'تأجير للمناسبات الراقية أو شراء وتملك فوري من نخبة الأتيليهات والمصممين في مصر، مع ضمان استرداد التأمين خلال 24 ساعة.',
                            'Rent for gala occasions or buy directly from premier ateliers across Egypt with guaranteed 24h deposit refund protection.'
                        )}
                    </p>

                    {/* Quick Search Form */}
                    <form
                        onSubmit={handleSearch}
                        className="bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-stone-100 p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center shadow-2xl backdrop-blur max-w-2xl mx-auto border border-stone-200/60 dark:border-stone-700/60"
                    >
                        <div className="flex items-center gap-2 w-full md:flex-1 px-3 py-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl border border-transparent focus-within:border-amber-500 transition-colors">
                            <Calendar className="h-4 w-4 text-stone-400 shrink-0" />
                            <input
                                type="date"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                                className="border-0 bg-transparent text-xs w-full focus:ring-0 text-stone-900 dark:text-stone-100 p-0"
                                aria-label="Event Date"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:flex-1 px-3 py-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl border border-transparent focus-within:border-amber-500 transition-colors">
                            <select
                                value={searchCategory}
                                onChange={(e) => setSearchCategory(e.target.value)}
                                className="border-0 bg-transparent text-xs w-full focus:ring-0 text-stone-900 dark:text-stone-100 p-0"
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

                        <button
                            type="submit"
                            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-2.5 rounded-xl uppercase tracking-wider text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
                        >
                            <Search className="h-3.5 w-3.5" />
                            <span>{tr('استكشفي الكتالوج', 'Explore Catalog')}</span>
                        </button>
                    </form>
                </div>
            </section>

            {/* Specialty Category Grid */}
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
                        <div className="flex flex-wrap gap-2 text-xs">
                            <Link
                                href="/catalog?mode=rent"
                                className="px-3.5 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 hover:border-stone-900 dark:hover:border-white transition-colors font-medium text-stone-800 dark:text-stone-200"
                            >
                                {tr('الإيجار للمناسبات', 'Rent for Events')}
                            </Link>
                            <Link
                                href="/catalog?mode=sale"
                                className="px-3.5 py-1.5 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 transition-colors font-medium"
                            >
                                {tr('شراء وتملك فوري', 'Direct Buy')}
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                        {[
                            { slug: 'wedding-evening-gowns', nameAr: 'فساتين سهرة وزفاف', nameEn: 'Wedding & Evening', icon: '👗', count: '25+ قطعة' },
                            { slug: 'luxury-abayas-kaftans', nameAr: 'عبايات وقفاطين فاخرة', nameEn: 'Abayas & Kaftans', icon: '✨', count: 'تصاميم ملكية' },
                            { slug: 'bridal-jewelry-accessories', nameAr: 'مجوهرات وتيجان الزفاف', nameEn: 'Bridal Jewelry', icon: '💎', count: 'زركون وكريستال' },
                            { slug: 'occasion-bags-shoes', nameAr: 'حقائب وأحذية مناسبات', nameEn: 'Bags & Footwear', icon: '👠', count: 'كلاتشات وسواريه' },
                            { slug: 'handmade-designer-brands', nameAr: 'براندات كوتور يدوية', nameEn: 'Handmade Couture', icon: '🪡', count: 'تفصيل يدوي' },
                        ].map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/catalog?category=${cat.slug}`}
                                className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-500/60 hover:shadow-lg transition-all text-center flex flex-col items-center justify-between"
                            >
                                <span className="text-3xl sm:text-4xl mb-2.5 group-hover:scale-110 transition-transform">
                                    {cat.icon}
                                </span>
                                <div>
                                    <h3 className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        {isRtl ? cat.nameAr : cat.nameEn}
                                    </h3>
                                    <p className="text-[10px] text-stone-400 mt-0.5">{cat.count}</p>
                                </div>
                                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-2 inline-flex items-center gap-1 group-hover:underline">
                                    {tr('تصفحي القطع ➔', 'Browse ➔')}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Curated Collection Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h3 className="text-xs font-bold tracking-[0.2em] text-rose-600 dark:text-rose-400 uppercase mb-1.5">
                            {tr('مختارات هذا الأسبوع', 'Curated This Week')}
                        </h3>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
                            {tr('الأكثر طلباً (Trending Now)', 'Trending Couture Gowns')}
                        </h2>
                    </div>
                    <Link
                        href="/catalog"
                        className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-300 border-b border-stone-400 pb-0.5 hover:border-stone-900 dark:hover:border-stone-100 hover:text-amber-700 dark:hover:text-amber-400 transition-all"
                    >
                        {tr('عرض الكل ➔', 'View All ➔')}
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {trending.map((dress: any) => (
                        <Link href={`/dresses/${dress.slug}`} key={dress.id} className="group cursor-pointer">
                            <div className="aspect-[3/4] overflow-hidden bg-stone-100 dark:bg-stone-800 rounded-2xl mb-3.5 relative shadow-sm border border-stone-200/80 dark:border-stone-800">
                                <img
                                    src={
                                        resolveImageUrl(dress.primary_image?.image_path || dress.images?.[0]?.image_path) ||
                                        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800'
                                    }
                                    alt={dress.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
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
                                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                        <p className="text-[11px] text-stone-400 uppercase tracking-wider">
                                            {dress.atelier?.business_name || dress.atelier?.name || 'Maison Atelier'}
                                        </p>
                                        {(dress.city || dress.governorate || dress.atelier?.city || dress.atelier?.governorate) && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200/60 dark:border-amber-900/40">
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
                                    <h4 className="font-serif text-base text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        {dress.title}
                                    </h4>
                                </div>
                                <div className={isRtl ? 'text-left shrink-0' : 'text-right shrink-0'}>
                                    <p className="font-bold text-sm text-stone-900 dark:text-stone-100 font-mono">
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

            {/* HOW IT WORKS SECTION (Direct Anchor #how-it-works) */}
            <section id="how-it-works" className="py-20 bg-stone-900 text-stone-100 relative overflow-hidden scroll-mt-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-stone-900 to-black pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/40 px-3.5 py-1 text-xs text-amber-300 backdrop-blur mb-3">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{tr('تجربة ملكية سلسة وموثقة', 'Seamless Royal Experience')}</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-4">
                            {tr('كيف يعمل ميزون رنتال؟', 'How Maison Rentale Works')}
                        </h2>
                        <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
                            {tr(
                                'أربع خطوات سهلة وموثقة تضمن لكِ إطلالة ساحرة وحماية مالية كاملة مع استرداد التأمين خلال 24 ساعة.',
                                'Four easy and verified steps ensuring radiant elegance and total financial protection with 24h deposit return.'
                            )}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {/* Step 1 */}
                        <div className="bg-stone-800/80 backdrop-blur border border-stone-700/80 rounded-2xl p-6 sm:p-7 relative group hover:border-amber-500/60 transition-all duration-300">
                            <span className="font-mono text-3xl font-extrabold text-amber-400/30 group-hover:text-amber-400/60 transition-colors absolute top-5 left-5 rtl:left-auto rtl:right-5">
                                01
                            </span>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5">
                                <Search className="h-6 w-6" />
                            </div>
                            <h3 className="font-serif text-lg font-bold text-white mb-2">
                                {tr('اختيار القطعة والمقاس', 'Discover & Choose')}
                            </h3>
                            <p className="text-xs text-stone-300 leading-relaxed">
                                {tr(
                                    'تصفحي آلاف الفساتين والعبايات الراقية والمجوهرات من أفضل الأتيليهات، مع إمكانية الفلترة حسب التاريخ والمناسبة.',
                                    'Explore thousands of luxury gowns, abayas, and bridal accessories filtered by occasion date and style.'
                                )}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-stone-800/80 backdrop-blur border border-stone-700/80 rounded-2xl p-6 sm:p-7 relative group hover:border-amber-500/60 transition-all duration-300">
                            <span className="font-mono text-3xl font-extrabold text-amber-400/30 group-hover:text-amber-400/60 transition-colors absolute top-5 left-5 rtl:left-auto rtl:right-5">
                                02
                            </span>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <h3 className="font-serif text-lg font-bold text-white mb-2">
                                {tr('تثبيت الحجز (10% أونلاين)', '10% Online Hold')}
                            </h3>
                            <p className="text-xs text-stone-300 leading-relaxed">
                                {tr(
                                    'ادفعي عربون حجز رمزي (10% فقط) بأمان تام عبر Paymob لحجز التاريخ لحسابك فورياً وفتح بيانات الأتيليه للتواصل والبروفة.',
                                    'Pay a small 10% online hold securely via Paymob to reserve your date and instantly unlock atelier direct contact.'
                                )}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-stone-800/80 backdrop-blur border border-stone-700/80 rounded-2xl p-6 sm:p-7 relative group hover:border-amber-500/60 transition-all duration-300">
                            <span className="font-mono text-3xl font-extrabold text-amber-400/30 group-hover:text-amber-400/60 transition-colors absolute top-5 left-5 rtl:left-auto rtl:right-5">
                                03
                            </span>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5">
                                <Store className="h-6 w-6" />
                            </div>
                            <h3 className="font-serif text-lg font-bold text-white mb-2">
                                {tr('البروفة والاستلام بالأتيليه', 'Fitting & In-Atelier Pickup')}
                            </h3>
                            <p className="text-xs text-stone-300 leading-relaxed">
                                {tr(
                                    'توجهي للأتيليه بكود الاستلام (QR Pass) للبروفة وتجربة الفستان، وسداد باقي القيمة نقداً مع مبلغ التأمين المسترد.',
                                    'Visit the studio with your QR Pass for on-site fitting, paying the offline balance and refundable deposit.'
                                )}
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-stone-800/80 backdrop-blur border border-stone-700/80 rounded-2xl p-6 sm:p-7 relative group hover:border-amber-500/60 transition-all duration-300">
                            <span className="font-mono text-3xl font-extrabold text-amber-400/30 group-hover:text-amber-400/60 transition-colors absolute top-5 left-5 rtl:left-auto rtl:right-5">
                                04
                            </span>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="font-serif text-lg font-bold text-white mb-2">
                                {tr('استرداد التأمين خلال 24 ساعة', 'Guaranteed 24h Refund')}
                            </h3>
                            <p className="text-xs text-stone-300 leading-relaxed">
                                {tr(
                                    'أعيدي الفستان بعد مناسبتكِ، واستردي مبلغ التأمين كاملاً خلال 24 ساعة مع إقرار استلام إلكتروني موثق من الطرفين.',
                                    'Return the gown and receive your full security deposit within 24 hours, confirmed with our two-way electronic receipt.'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Trust Badges Bar */}
                    <div className="mt-14 pt-10 border-t border-stone-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs text-stone-400">
                        <div className="flex flex-col items-center gap-2">
                            <Lock className="h-5 w-5 text-amber-400" />
                            <span className="font-bold text-stone-200">{tr('دفع مشفر وآمن عبر Paymob', 'Paymob 256-bit Encrypted')}</span>
                            <span className="text-[11px]">{tr('بوابات دفع إلكترونية معتمدة بالبنك المركزي', 'CBE Certified')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <RotateCcw className="h-5 w-5 text-amber-400" />
                            <span className="font-bold text-stone-200">{tr('ضمان رد التأمين 24 ساعة', '24h Deposit Return')}</span>
                            <span className="text-[11px]">{tr('إلزام تعاقدي موثق بالإيصالات', 'Contractual Guarantee')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Award className="h-5 w-5 text-amber-400" />
                            <span className="font-bold text-stone-200">{tr('قطع أصلية وتفصيل يدوي', '100% Authentic Haute Couture')}</span>
                            <span className="text-[11px]">{tr('فحص دقيق لجودة الأقمشة والتطريز', 'Inspected Quality')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <HeartHandshake className="h-5 w-5 text-amber-400" />
                            <span className="font-bold text-stone-200">{tr('قانون حماية المستهلك المصري', 'Egyptian Law Protected')}</span>
                            <span className="text-[11px]">{tr('حق الاسترجاع والاستبدال 14 يوماً للبيع', '14-Day Consumer Rights')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Atelier Spotlight */}
            <section className="py-16 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">
                            {tr('أتيليهات مصممة بعناية', 'Handcrafted Ateliers')}
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                            {tr('شركاؤنا من دور الأزياء والمصممين في مصر', 'Our Partner Ateliers & Designers')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(featuredAteliers || []).map((atelier: any) => {
                            const atelierName = atelier.business_name || atelier.name || 'Maison Atelier';
                            return (
                                <div
                                    key={atelier.id}
                                    className="bg-white dark:bg-stone-900 p-6 rounded-2xl text-center shadow-xs border border-stone-200 dark:border-stone-800 hover:shadow-md transition-shadow"
                                >
                                    <div className="w-16 h-16 bg-stone-900 dark:bg-stone-800 rounded-full mx-auto mb-3.5 flex items-center justify-center text-amber-300 text-xl font-serif font-bold">
                                        {atelierName.charAt(0).toUpperCase()}
                                    </div>
                                    <h4 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 mb-1">
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
