import React from 'react';
import { Head } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Badge } from '@/Components/UI/Badge';
import { Button } from '@/Components/UI/Button';
import { MessageSquare, Plus, Scale, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface DisputesProps {
    disputes: Array<{
        id: number;
        booking_reference: string | null;
        reason: string;
        status: string;
        created_at: string | null;
        resolution: string | null;
    }>;
}

export default function CustomerDisputes({ disputes }: DisputesProps) {
    const { tr } = useLanguage();

    return (
        <CustomerLayout>
            <Head title={tr('النزاعات والدعم الفني | Maison Rentale', 'Disputes & Support | Maison Rentale')} />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">
                            {tr('النزاعات والدعم الفني (Disputes & Resolution)', 'Disputes & Support Resolution')}
                        </h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            {tr(
                                'متابعة الشكاوى وبلاغات التلفيات أو استرداد مبالغ التأمين مع إدارة المنصة',
                                'Track complaints, damage reports, or security deposit refund appeals with administration'
                            )}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden">
                    <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <Scale className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                            {tr(`النزاعات المفتوحة والسابقة (${disputes.length})`, `Open & Past Disputes (${disputes.length})`)}
                        </span>
                    </div>

                    {disputes.length === 0 ? (
                        <div className="p-12 text-center text-sm text-stone-400 dark:text-stone-500">
                            <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                {tr('لا توجد أي نزاعات أو شكاوى معلقة.', 'No open disputes or pending complaints.')}
                            </p>
                            <p className="text-xs mt-1">
                                {tr('جميع تعاملاتك وحجوزاتك سارية بسلاسة وأمان تام.', 'All your bookings and transactions are running smoothly and securely.')}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                            {disputes.map((d) => (
                                <div key={d.id} className="p-6 space-y-2 hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                                                {tr('الحجز:', 'Booking:')} #{d.booking_reference || 'N/A'}
                                            </span>
                                            <Badge tone={d.status === 'open' ? 'warning' : 'success'}>{d.status}</Badge>
                                        </div>
                                        <span className="text-xs font-mono text-stone-500 dark:text-stone-400">{d.created_at || '—'}</span>
                                    </div>
                                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{d.reason}</p>
                                    {d.resolution && (
                                        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-stone-900 dark:text-stone-200 border border-amber-200 dark:border-amber-800">
                                            <strong>{tr('قرار الإدارة:', 'Admin Ruling:')}</strong> {d.resolution}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
