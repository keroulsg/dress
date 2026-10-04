import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AtelierLayout from '@/Layouts/AtelierLayout';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { Textarea } from '@/Components/UI/Textarea';
import { Check, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn } from '@/Lib/utils';

interface InspectionShowProps {
    atelier: { id: number; business_name: string };
    booking: {
        id: number;
        booking_reference: string;
        status: string;
        start_date: string | null;
        end_date: string | null;
    };
    summary: any;
}

export default function InspectionShow({ atelier, booking, summary }: InspectionShowProps) {
    const { t, tr, isRtl } = useLanguage();

    const { data, setData, post, processing } = useForm({
        condition_summary: tr(
            'الفستان في حالة ممتازة ومكوي بدون أي عيوب أو بقع.',
            'The dress is in pristine condition, professionally pressed, with no defects or stains.'
        ),
        damage_description: '',
    });

    const handleSubmitPreDispatch = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/atelier/${atelier.id}/inspections/${booking.id}/pre-dispatch`);
    };

    const handleSubmitPostReturn = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/atelier/${atelier.id}/inspections/${booking.id}/post-return`);
    };

    const getStatusLabel = (st: string): string => {
        return t(`status.${st}`, st);
    };

    return (
        <AtelierLayout
            title={`${tr('تقرير فحص الحجز', 'Inspection')} #${booking.booking_reference}`}
            breadcrumbs={[
                { label: tr('طابور الفحص', 'Inspections'), href: `/atelier/${atelier.id}/inspections` },
                { label: `#${booking.booking_reference}` },
            ]}
        >
            <Head title={`Inspection #${booking.booking_reference} | ${atelier.business_name}`} />

            <div className="space-y-6 max-w-4xl">
                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('بيانات الحجز الخاضع للفحص', 'Active Booking Inspection')}
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                            #{booking.booking_reference}
                        </h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {tr('فترة الحجز:', 'Rental window:')} {booking.start_date || '—'} ← {booking.end_date || '—'}
                        </p>
                    </div>
                    <Badge tone="champagne" className="text-sm px-3 py-1 self-start sm:self-center">
                        {getStatusLabel(booking.status)}
                    </Badge>
                </div>

                {/* Inspection Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pre-Dispatch Box */}
                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                                {tr('1. فحص ما قبل التسليم (Pre-Dispatch)', '1. Pre-Dispatch Inspection')}
                            </h3>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                            {tr(
                                'توثيق حالة الفستان ونظافته وخلوه من التلف قبل تسليمه للعميل لحفظ الحقوق.',
                                'Document garment condition, quality check, and clean state prior to client handover.'
                            )}
                        </p>

                        <form onSubmit={handleSubmitPreDispatch} className="space-y-3 pt-2">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('ملخص الحالة (Condition Summary)', 'Condition Summary')}
                                </label>
                                <Textarea
                                    value={data.condition_summary}
                                    onChange={(e) => setData('condition_summary', e.target.value)}
                                    rows={3}
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 rounded-xl"
                                    required
                                />
                            </div>
                            <Button type="submit" variant="champagne" disabled={processing} className="w-full text-xs font-semibold">
                                <Check className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} />
                                {tr('تسجيل تقرير الفحص المبدئي', 'Save Pre-Dispatch Report')}
                            </Button>
                        </form>
                    </div>

                    {/* Post-Return Box */}
                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                                {tr('2. فحص بعد الاسترجاع (Post-Return)', '2. Post-Return Inspection')}
                            </h3>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                            {tr(
                                'مطابقة القطعة وتحديد وجود أي تلفيات أو حاجة لتنظيف جاف إضافي لخصم أو الإفراج عن مبلغ التأمين.',
                                'Inspect returned item, verify no damage or stains, and approve security deposit release.'
                            )}
                        </p>

                        <form onSubmit={handleSubmitPostReturn} className="space-y-3 pt-2">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('ملاحظات الفحص بعد الإرجاع', 'Post-Return Notes / Damages')}
                                </label>
                                <Textarea
                                    placeholder={tr('سليم تماماً ولا يوجد أي أضرار...', 'Pristine condition, ready for storage...')}
                                    value={data.damage_description}
                                    onChange={(e) => setData('damage_description', e.target.value)}
                                    rows={3}
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 rounded-xl"
                                />
                            </div>
                            <Button type="submit" variant="primary" disabled={processing} className="w-full text-xs font-semibold">
                                <CheckCircle2 className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} />
                                {tr('تسجيل تقرير الاسترجاع والتسوية', 'Complete Inspection & Release')}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </AtelierLayout>
    );
}
