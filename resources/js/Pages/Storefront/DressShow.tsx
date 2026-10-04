import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import WishlistDrawer from '@/Modules/Storefront/WishlistDrawer';
import { Calendar, Check, Clock, Heart, ShieldCheck, Sparkles, Tag, Truck } from 'lucide-react';
import { formatCurrency } from '@/Lib/currency';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function DressShow({ dress, reviews }: any) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(
        dress.sizes && dress.sizes.length > 0 ? dress.sizes[0].size_code || dress.sizes[0] : null
    );
    const [isAddingWishlist, setIsAddingWishlist] = useState(false);

    const toggleWishlist = async () => {
        setIsAddingWishlist(true);
        try {
            const res = await fetch('/wishlist/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content,
                },
                body: JSON.stringify({ dress_id: dress.id }),
            });
            if (res.ok) {
                setIsWishlistOpen(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAddingWishlist(false);
        }
    };

    const handleReserve = () => {
        router.visit(`/checkout/${dress.id}`);
    };

    return (
        <StorefrontLayout>
            <Head title={`${dress.title} | Maison Rentale`} />

            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-6 flex items-center gap-2 text-xs text-stone-400">
                    <Link href="/" className="hover:text-stone-900 dark:hover:text-stone-100">
                        {tr('الرئيسية', 'Home')}
                    </Link>
                    <span>/</span>
                    <Link href="/catalog" className="hover:text-stone-900 dark:hover:text-stone-100">
                        {tr('الكتالوج', 'Catalog')}
                    </Link>
                    <span>/</span>
                    <span className="text-stone-900 dark:text-stone-100 font-medium truncate max-w-xs">{dress.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                    {/* Image Gallery (Left / Column 7) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {dress.images && dress.images.length > 0 ? (
                                dress.images.map((img: any, idx: number) => (
                                    <div
                                        key={img.id || idx}
                                        className={`overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800 relative group border border-stone-200 dark:border-stone-800 ${
                                            idx === 0 ? 'sm:col-span-2 aspect-[4/5]' : 'aspect-[3/4]'
                                        }`}
                                    >
                                        <img
                                            src={
                                                img.image_path ||
                                                img.path ||
                                                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'
                                            }
                                            alt={`${dress.title} view ${idx + 1}`}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="aspect-[4/5] rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                                    {tr('لا توجد صور متوفرة', 'No images available')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dress Info & Booking Card (Right / Column 5) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
                            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                                {dress.atelier?.business_name || dress.atelier?.name || 'Maison Atelier'}
                            </span>
                            <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100">
                                {dress.title}
                            </h1>
                            <div className="mt-3 flex flex-wrap items-baseline gap-3">
                                {dress.allows_rent !== false && (
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                                            {formatCurrency(dress.rental_price_per_day, 'EGP')}
                                        </span>
                                        <span className="text-xs text-stone-400">/{tr('يوم للإيجار', 'day')}</span>
                                    </div>
                                )}
                                {dress.allows_sale && dress.original_retail_value && (
                                    <div className="flex items-baseline gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
                                        <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold">{tr('سعر الشراء والتملك:', 'Purchase Price:')}</span>
                                        <span className="font-serif text-base font-bold text-amber-900 dark:text-amber-200">
                                            {formatCurrency(dress.original_retail_value, 'EGP')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                                {tr('الوصف والتفاصيل', 'Description & Craftsmanship')}
                            </h3>
                            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                                {dress.description ||
                                    tr(
                                        'فستان سهرة وتصميم هوت كوتور راقي مصنوع من أجود خامات الحرير والدانتيل الفرنسي، مناسب لحفلات الزفاف والمناسبات الكبرى.',
                                        'Luxury haute couture gown crafted from pristine silk and French lace, styled for galas and royal celebrations.'
                                    )}
                            </p>
                        </div>

                        {/* Size Selection */}
                        <div className="border-t border-stone-200 dark:border-stone-800 pt-5">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                                    {tr('اختر المقاس (Size)', 'Select Size')}
                                </h3>
                                <span className="text-[11px] text-stone-400">{tr('دليل المقاسات المعتمد', 'Size Guide')}</span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {dress.sizes && dress.sizes.length > 0 ? (
                                    dress.sizes.map((sz: any) => {
                                        const code = sz.size_code || sz;
                                        const isAvail = sz.is_available ?? true;
                                        const isSelected = selectedSize === code;
                                        return (
                                            <button
                                                key={sz.id || code}
                                                type="button"
                                                disabled={!isAvail}
                                                onClick={() => setSelectedSize(code)}
                                                className={`px-5 py-2 text-xs font-medium rounded-xl transition-all ${
                                                    !isAvail
                                                        ? 'opacity-40 cursor-not-allowed border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 text-stone-400 line-through'
                                                        : isSelected
                                                          ? 'border-2 border-amber-600 bg-stone-900 dark:bg-amber-600 text-amber-200 dark:text-white shadow-sm'
                                                          : 'border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 hover:border-amber-600'
                                                }`}
                                            >
                                                {code}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <span className="text-xs text-stone-400">{tr('المقاس القياسي متوفر', 'Standard size available')}</span>
                                )}
                            </div>
                        </div>

                        {/* Booking & Buy CTA Box */}
                        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between text-xs text-stone-400">
                                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {tr('قطعة حصرية جاهزة للطلب', 'Exclusive Piece Ready')}
                                </span>
                                <Link href="/terms#deposit-escrow" className="underline hover:text-amber-600">
                                    {tr('ضمان رد التأمين خلال 24 ساعة', '24h Deposit Refund Guarantee')}
                                </Link>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {dress.allows_rent !== false && (
                                    <button
                                        type="button"
                                        onClick={handleReserve}
                                        className="flex-1 rounded-xl bg-stone-900 dark:bg-stone-100 py-3.5 px-6 text-center text-sm font-semibold uppercase tracking-wider text-white dark:text-stone-900 hover:bg-black dark:hover:bg-white transition-colors shadow-md"
                                    >
                                        {tr('احجز للإيجار / Rent Now', 'Rent for Event')}
                                    </button>
                                )}
                                {dress.allows_sale && (
                                    <button
                                        type="button"
                                        onClick={handleReserve}
                                        className="flex-1 rounded-xl bg-amber-600 py-3.5 px-6 text-center text-sm font-semibold uppercase tracking-wider text-white hover:bg-amber-700 transition-colors shadow-md"
                                    >
                                        {tr('شراء وتملك فوري / Buy Now', 'Buy & Own')}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={toggleWishlist}
                                    disabled={isAddingWishlist}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-rose-500 hover:text-rose-600 transition-colors"
                                    aria-label="Add to wishlist"
                                >
                                    <Heart className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Luxury Guarantees */}
                        <div className="grid grid-cols-2 gap-4 border-t border-stone-200 dark:border-stone-800 pt-6">
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                                        {tr('أصلي 100% ومفحوص', '100% Verified Couture')}
                                    </p>
                                    <p className="text-[11px] text-stone-400">
                                        {tr('فحص جودة دقيق قبل التسليم', 'Rigorous quality inspection')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <Truck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                                        {tr('توصيل واستلام سريع', 'Express Delivery & Pickup')}
                                    </p>
                                    <p className="text-[11px] text-stone-400">
                                        {tr('مكوي ومعقم وجاهز للارتداء', 'Dry-cleaned & ready to wear')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
        </StorefrontLayout>
    );
}
