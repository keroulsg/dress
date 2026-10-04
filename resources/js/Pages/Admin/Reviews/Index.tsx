import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Star, MessageSquare, Trash2, Search, ThumbsUp } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface Props {
    reviews: {
        data: any[];
        links: any[];
        total: number;
    };
    stats: {
        total: number;
        average_rating: number;
        five_star: number;
        flagged_or_low: number;
    };
    filters: {
        search?: string;
        rating?: string;
    };
}

export default function ReviewsIndex({ reviews, stats, filters }: Props) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/reviews', { search: searchTerm, rating: filters.rating }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        const confirmMsg = isRtl
            ? 'تحذير: هل أنت متأكد من رغبتك في حذف هذا التقييم نهائياً من المنصة؟'
            : 'Warning: Are you sure you want to permanently delete this review?';
        if (confirm(confirmMsg)) {
            router.delete(`/admin/reviews/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title={tr('مراقبة تقييمات المنصة | Maison Admin', 'Reviews Oversight | Maison Admin')} />

            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                    {tr('إدارة تقييمات الفساتين والأتيليهات', 'Dresses & Ateliers Reviews Management')}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {tr(
                        'متابعة جودة الخدمات، تقييمات النجوم، ومراجعة التعليقات للحد من الإساءات وحماية جودة المنصة',
                        'Monitor service quality, star ratings, and community reviews to ensure platform excellence'
                    )}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('إجمالي التقييمات', 'Total Reviews')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.total}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('تقييم منشور', 'Published customer reviews')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('متوسط تقييم المنصة', 'Platform Average')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <Star className="h-4 w-4 text-amber-600 fill-amber-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">
                        {stats.average_rating.toFixed(1)} / 5.0
                    </p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                        {tr('مؤشر رضا العملاء عالي', 'High customer satisfaction')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('تقييمات 5 نجوم', '5-Star Reviews')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                            <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.five_star}</p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                        {tr('إشادات ممتازة', 'Praise & top satisfaction')}
                    </span>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('تقييمات منخفضة (≤ 2)', 'Low Ratings (≤ 2)')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                            <Star className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.flagged_or_low}</p>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 block">
                        {tr('تحتاج متابعة مع الأتيليه', 'Requires atelier follow-up')}
                    </span>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
                <div className="overflow-x-auto">
                    <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                        <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3.5">{tr('العميل', 'Customer')}</th>
                                <th className="px-5 py-3.5">{tr('الفستان والأتيليه', 'Dress & Atelier')}</th>
                                <th className="px-5 py-3.5">{tr('التقييم', 'Rating')}</th>
                                <th className="px-5 py-3.5">{tr('نص التعليق', 'Review Note')}</th>
                                <th className="px-5 py-3.5">{tr('التاريخ', 'Date')}</th>
                                <th className="px-5 py-3.5 text-center">{tr('حذف', 'Delete')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                            {reviews.data.length > 0 ? (
                                reviews.data.map((rev) => (
                                    <tr key={rev.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-stone-900 dark:text-stone-100">{rev.renter?.name || tr('عميلة', 'Customer')}</p>
                                            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">{rev.renter?.email}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-stone-900 dark:text-stone-100 font-medium">{rev.dress?.title || tr('فستان', 'Dress')}</p>
                                            <p className="text-[11px] text-amber-700 dark:text-amber-400">{rev.atelier?.business_name || tr('أتيليه', 'Atelier')}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                {Array.from({ length: rev.rating }).map((_, i) => (
                                                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                ))}
                                                <span className="text-stone-400 dark:text-stone-500 text-xs font-mono ml-1">({rev.rating}/5)</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-stone-600 dark:text-stone-300 max-w-md">
                                            <p className="line-clamp-2 leading-relaxed">{rev.comment || tr('بدون تعليق نصي', 'No text comment')}</p>
                                        </td>
                                        <td className="px-5 py-4 text-stone-400 dark:text-stone-500 font-mono text-[11px]">
                                            {new Date(rev.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(rev.id)}
                                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                title={tr('حذف التقييم', 'Delete review')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-stone-400 dark:text-stone-500">
                                        {tr('لا توجد تقييمات منشورة حالياً.', 'No reviews published currently.')}
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
