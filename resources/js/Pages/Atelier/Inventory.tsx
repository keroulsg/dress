import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AtelierLayout from '@/Layouts/AtelierLayout';
import { formatCurrency } from '@/Lib/currency';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Edit, Eye, Plus, Sparkles, Tag, Wrench } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';
import { resolveImageUrl } from '@/Lib/utils';

interface InventoryProps {
    atelier: { id: number; business_name: string };
    dresses: Array<{
        id: number;
        title: string;
        status: string;
        rental_price_per_day: string;
        category: string | null;
        primary_image: string | null;
        sizes: string[];
    }>;
}

export default function AtelierInventory({ atelier, dresses }: InventoryProps) {
    const { tr } = useLanguage();

    return (
        <AtelierLayout
            title={tr('إدارة المخزون والفساتين', 'Inventory & Wardrobe')}
            breadcrumbs={[{ label: tr('المخزون', 'Inventory') }]}
        >
            <Head title={`${tr('المخزون', 'Inventory')} | ${atelier.business_name}`} />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100">
                            {tr('إدارة مخزون الفساتين والقطع', 'Dresses & Haute Couture Inventory')}
                        </h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            {tr(
                                'متابعة حالة القطع، تعديل الأسعار، وجدولة الصيانة والتنظيف الجاف',
                                'Monitor piece status, adjust rental pricing, and schedule dry cleaning'
                            )}
                        </p>
                    </div>

                    <Button asChild variant="champagne" size="sm" className="text-xs">
                        <Link href={`/atelier/${atelier.id}/dresses/create`}>
                            <Plus className="h-4 w-4 mr-1" />
                            {tr('إضافة فستان جديد', 'Add New Dress')}
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dresses.map((dress) => (
                        <div
                            key={dress.id}
                            className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm flex flex-col justify-between"
                        >
                            <div className="relative aspect-[3/4] bg-stone-100 dark:bg-stone-800">
                                <img
                                    src={
                                        resolveImageUrl(dress.primary_image) ||
                                        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800'
                                    }
                                    alt={dress.title}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute top-3 left-3">
                                    <Badge tone={dress.status === 'active' ? 'success' : 'warning'}>
                                        {dress.status === 'active' ? tr('نشط في الكتالوج', 'Active in Catalog') : dress.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div>
                                    <span className="text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold">
                                        {dress.category || 'Evening'}
                                    </span>
                                    <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-semibold mt-0.5">
                                        {dress.title}
                                    </h3>
                                    <p className="mt-2 font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                                        {formatCurrency(dress.rental_price_per_day, 'EGP')}{' '}
                                        <span className="text-xs font-normal text-stone-400">/{tr('يوم', 'day')}</span>
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {dress.sizes.map((s) => (
                                            <span
                                                key={s}
                                                className="rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:text-stone-300"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-stone-100 dark:border-stone-800 pt-3 flex items-center justify-between">
                                    <Button asChild variant="outline" size="sm" className="text-xs">
                                        <Link href={`/atelier/${atelier.id}/dresses/${dress.id}/edit`}>
                                            <Edit className="h-3.5 w-3.5 mr-1" />
                                            {tr('تعديل', 'Edit')}
                                        </Link>
                                    </Button>

                                    <Button asChild variant="ghost" size="sm" className="text-xs">
                                        <Link href={`/catalog/${dress.id}`}>
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            {tr('معاينة', 'Preview')}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AtelierLayout>
    );
}
