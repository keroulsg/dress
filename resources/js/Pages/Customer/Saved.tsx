import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { formatCurrency } from '@/Lib/currency';
import { Button } from '@/Components/UI/Button';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface SavedProps {
    saved_dresses: Array<{
        id: number;
        title: string;
        rental_price_per_day: string;
        atelier?: { id: number; business_name: string } | null;
        images?: Array<{ id: number; image_path: string }>;
    }>;
}

export default function CustomerSaved({ saved_dresses }: SavedProps) {
    const { tr } = useLanguage();

    return (
        <CustomerLayout>
            <Head title={tr('الفساتين المحفوظة والمفضلة | Maison Rentale', 'Saved Dresses | Maison Rentale')} />

            <div className="space-y-6">
                <div>
                    <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">
                        {tr('الفساتين المحفوظة والمفضلة (Wishlist)', 'Saved Dresses & Wishlist')}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {tr(
                            'القطع والتصميمات التي قمتِ بحفظها للرجوع إليها وحجزها لاحقاً',
                            'Pieces and haute couture designs you saved to rent for upcoming events'
                        )}
                    </p>
                </div>

                {saved_dresses.length === 0 ? (
                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-12 text-center text-sm text-stone-400 dark:text-stone-500 shadow-sm">
                        <Heart className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                        <p className="font-medium text-stone-900 dark:text-stone-100">
                            {tr('قائمة المفضلة فارغة حالياً.', 'Your wishlist is currently empty.')}
                        </p>
                        <p className="text-xs mt-1">
                            {tr(
                                'تصفحي الكتالوج واضغطي على علامة القلب لحفظ الفساتين.',
                                'Browse our catalog and tap the heart icon on dresses you love.'
                            )}
                        </p>
                        <Button asChild variant="champagne" size="sm" className="mt-4 text-xs">
                            <Link href="/catalog">{tr('تصفح الكتالوج', 'Explore Catalog')}</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {saved_dresses.map((dress) => (
                            <div
                                key={dress.id}
                                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm flex flex-col justify-between"
                            >
                                <div className="aspect-[3/4] bg-stone-100 dark:bg-stone-800 relative">
                                    <img
                                        src={
                                            dress.images?.[0]?.image_path ||
                                            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'
                                        }
                                        alt={dress.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                    <div>
                                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                                            {dress.atelier?.business_name || 'Atelier'}
                                        </span>
                                        <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                                            {dress.title}
                                        </h3>
                                        <p className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                                            {formatCurrency(dress.rental_price_per_day, 'EGP')}{' '}
                                            <span className="text-xs font-normal text-stone-400">/{tr('يوم', 'day')}</span>
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex gap-2">
                                        <Button asChild variant="champagne" size="sm" className="flex-1 text-xs">
                                            <Link href={`/checkout/${dress.id}`}>
                                                <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                                                {tr('احجز الآن', 'Rent Now')}
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm" className="text-xs">
                                            <Link href={`/catalog/${dress.id}`}>{tr('التفاصيل', 'Details')}</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
