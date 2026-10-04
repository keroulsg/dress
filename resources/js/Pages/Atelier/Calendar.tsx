import React from 'react';
import { Head } from '@inertiajs/react';
import AtelierLayout from '@/Layouts/AtelierLayout';
import { Badge } from '@/Components/UI/Badge';
import { Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface AtelierCalendarProps {
    atelier: { id: number; business_name: string };
    dresses: Array<{ id: number; title: string; slug: string }>;
    bookings: Array<{
        id: number;
        booking_reference: string;
        status: string;
        start_date: string;
        end_date: string;
        renter: string;
        dress: string;
    }>;
}

export default function AtelierCalendar({ atelier, dresses, bookings }: AtelierCalendarProps) {
    const { tr } = useLanguage();

    return (
        <AtelierLayout
            title={tr('التقويم والمواعيد', 'Calendar & Availability')}
            breadcrumbs={[{ label: tr('التقويم', 'Calendar') }]}
        >
            <Head title={`${tr('التقويم', 'Calendar')} | ${atelier.business_name}`} />

            <div className="space-y-8">
                <div>
                    <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100">
                        {tr('جدول المواعيد وفترات الحجز والتعقيم', 'Schedule, Bookings & Sanitization Windows')}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {tr(
                            'متابعة الفترات المحجوزة للفساتين وفترات التنظيف والتجهيز (Buffer days)',
                            'Track reserved rental dates and dry-cleaning buffer days between orders'
                        )}
                    </p>
                </div>

                {/* Calendar list */}
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden">
                    <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                            {tr(`مواعيد الحجوزات القادمة (${bookings.length})`, `Upcoming Bookings (${bookings.length})`)}
                        </span>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="p-12 text-center text-sm text-stone-400 dark:text-stone-500">
                            <CalendarIcon className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                {tr('لا توجد حجوزات مجدولة في الوقت الحالي.', 'No scheduled bookings at this time.')}
                            </p>
                            <p className="text-xs mt-1">
                                {tr('جميع الفساتين متاحة بالكامل للحجز الفوري.', 'All dresses are currently available for instant reservation.')}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                            {bookings.map((b) => (
                                <div
                                    key={b.id}
                                    className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                                                #{b.booking_reference}
                                            </span>
                                            <Badge tone="champagne">{b.status}</Badge>
                                        </div>
                                        <h3 className="font-serif text-base text-stone-900 dark:text-stone-100 font-semibold">{b.dress}</h3>
                                        <p className="text-xs text-stone-500 dark:text-stone-400">
                                            {tr('العميل:', 'Customer:')} {b.renter}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
                                        <Clock className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                                        <span className="font-mono font-medium text-stone-900 dark:text-stone-100">
                                            {b.start_date} ← {b.end_date}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AtelierLayout>
    );
}
