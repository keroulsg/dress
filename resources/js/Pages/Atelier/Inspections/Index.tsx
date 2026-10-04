import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AtelierLayout from '@/Layouts/AtelierLayout';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { ArrowRight, ArrowLeft, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn } from '@/Lib/utils';

interface InspectionsIndexProps {
    atelier: { id: number; business_name: string };
    queue: Array<{
        id: number;
        booking_reference: string;
        status: string;
        dress_title: string | null;
        renter: string | null;
        start_date: string | null;
    }>;
}

export default function InspectionsIndex({ atelier, queue }: InspectionsIndexProps) {
    const { t, tr, isRtl } = useLanguage();

    const getStatusLabel = (st: string): string => {
        return t(`status.${st}`, st);
    };

    return (
        <AtelierLayout
            title={tr('طابور فحص الاستلام والتسليم', 'Inspection Queue & Returns')}
            breadcrumbs={[{ label: tr('الفحص', 'Inspections') }]}
        >
            <Head title={`${tr('فحص الاستلام والتسليم', 'Inspections')} | ${atelier.business_name}`} />

            <div className="space-y-6">
                <div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                        {tr('طابور فحص القطع والفساتين', 'Garment Inspection & Quality Gate')}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {tr(
                            'توثيق حالة الفساتين قبل التسليم للعميلة (Pre-dispatch) ومطابقة الحالة بعد الاسترجاع (Post-return) لضمان حقوق الأتيليه والأمانات.',
                            'Document garment condition before dispatch (Pre-dispatch) and verify upon return (Post-return) to release security deposits.'
                        )}
                    </p>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs overflow-hidden">
                    <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                            {tr(`الحجوزات التي تتطلب فحص (${queue.length})`, `Bookings Requiring Inspection (${queue.length})`)}
                        </span>
                    </div>

                    {queue.length === 0 ? (
                        <div className="p-12 text-center text-sm text-stone-400 dark:text-stone-500">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                {tr('طابور الفحص مكتمل بالكامل!', 'Inspection queue is completely clear!')}
                            </p>
                            <p className="text-xs mt-1">
                                {tr('لا توجد قطع معلقة بانتظار الفحص في الوقت الحالي.', 'No garments currently pending quality inspection.')}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-xs">
                                <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400 uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-3.5 text-start">{tr('رقم الحجز', 'Booking Ref')}</th>
                                        <th className="px-6 py-3.5 text-start">{tr('الفستان', 'Gown')}</th>
                                        <th className="px-6 py-3.5 text-start">{tr('المستأجرة', 'Renter')}</th>
                                        <th className="px-6 py-3.5 text-start">{tr('تاريخ البدء', 'Start Date')}</th>
                                        <th className="px-6 py-3.5 text-start">{tr('حالة الحجز', 'Status')}</th>
                                        <th className="px-6 py-3.5 text-end">{tr('الإجراء', 'Action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {queue.map((item) => (
                                        <tr key={item.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                                                #{item.booking_reference}
                                            </td>
                                            <td className="px-6 py-4 font-serif font-bold text-stone-900 dark:text-stone-100">
                                                {item.dress_title || tr('فستان هوت كوتور', 'Haute Couture Dress')}
                                            </td>
                                            <td className="px-6 py-4 text-stone-700 dark:text-stone-300">
                                                {item.renter || 'Guest'}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-stone-500 dark:text-stone-400">
                                                {item.start_date || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge tone={item.status === 'confirmed' ? 'champagne' : 'warning'}>
                                                    {getStatusLabel(item.status)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-end">
                                                <Button asChild size="sm" variant="champagne" className="text-xs">
                                                    <Link href={`/atelier/${atelier.id}/inspections/${item.id}`}>
                                                        <span>{tr('بدء الفحص', 'Start Inspection')}</span>
                                                        {isRtl ? (
                                                            <ArrowLeft className="h-3 w-3 mr-1" />
                                                        ) : (
                                                            <ArrowRight className="h-3 w-3 ml-1" />
                                                        )}
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AtelierLayout>
    );
}
