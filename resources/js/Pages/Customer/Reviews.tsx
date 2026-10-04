import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { MessageSquare, Star } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface ReviewsProps {
    reviews: Array<{
        id: number;
        dress_title: string | null;
        rating: number;
        comment: string | null;
        created_at: string | null;
    }>;
}

export default function CustomerReviews({ reviews }: ReviewsProps) {
    const { tr } = useLanguage();

    return (
        <CustomerLayout>
            <Head title={tr('التقييمات والآراء | Maison Rentale', 'My Reviews | Maison Rentale')} />

            <div className="space-y-6">
                <div>
                    <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">
                        {tr('التقييمات والآراء (My Reviews)', 'My Reviews & Ratings')}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {tr(
                            'مراجعاتك وتقييماتك لتجربة استئجار الفساتين والتعامل مع الأتيليهات',
                            'Your impressions, reviews, and feedback on dress condition and atelier service'
                        )}
                    </p>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden">
                    <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                            {tr(`تقييماتي السابقة (${reviews.length})`, `My Submitted Reviews (${reviews.length})`)}
                        </span>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="p-12 text-center text-sm text-stone-400 dark:text-stone-500">
                            <Star className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                {tr('لم تقومي بكتابة أي تقييم بعد.', 'You have not submitted any reviews yet.')}
                            </p>
                            <p className="text-xs mt-1">
                                {tr(
                                    'بعد استكمال وإرجاع أي فستان، يمكنك تقييم التجربة وجودة القطعة.',
                                    'Once a dress is returned and completed, you can review its fit and quality.'
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                            {reviews.map((r) => (
                                <div key={r.id} className="p-6 space-y-2 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
                                            {r.dress_title || 'Haute Couture Dress'}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, idx) => (
                                                <Star
                                                    key={idx}
                                                    className={`h-4 w-4 ${
                                                        idx < r.rating
                                                            ? 'text-amber-500 fill-amber-400'
                                                            : 'text-stone-200 dark:text-stone-700'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                                        {r.comment || tr('تجربة ممتازة والفستان بحالة رائعة وتوصيل دقيق.', 'Excellent experience, dress was in pristine condition.')}
                                    </p>
                                    <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500 block">
                                        {r.created_at || '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
