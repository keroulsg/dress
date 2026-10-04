import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import { Mail, Phone, MessageSquare, MapPin, Clock, Building2, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
    contact_info: {
        entity_name: string;
        commercial_email: string;
        phone: string;
        whatsapp: string;
        address: string;
        working_hours: string;
    };
}

export default function Contact({ contact_info }: Props) {
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => reset(),
        });
    };

    return (
        <StorefrontLayout>
            <Head title="اتصل بنا والدعم الفني — Maison Rentale" />

            <div className="bg-stone-50 dark:bg-[#0c0a09] py-12 lg:py-16 text-charcoal dark:text-stone-100" dir="rtl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-4 border border-amber-200 dark:border-amber-900/50">
                            <ShieldCheck className="w-4 h-4" />
                            <span>مركز العناية بالعميلات والأتيليهات الشريكة</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 dark:text-white mb-4">
                            تواصل معنا — نحن هنا لمساعدتكِ دائماً
                        </h1>
                        <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                            يسعد فريق الدعم الفني وخدمة العملاء في ميزون رنتال الرد على كافة استفساراتكِ ومساعدتكِ في تجربة الحجز والشراء أو تسوية أي ملاحظات.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Company & Official Contact Info Card */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-6">
                                <div>
                                    <div className="flex items-center gap-2.5 text-stone-900 dark:text-white font-bold text-base mb-1">
                                        <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
                                        <span>الكيان التجاري المعتمد</span>
                                    </div>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 pr-7">
                                        {contact_info.entity_name}
                                    </p>
                                </div>

                                <div className="border-t border-stone-100 dark:border-stone-800 pt-5">
                                    <div className="flex items-center gap-2.5 text-stone-900 dark:text-white font-bold text-base mb-1">
                                        <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
                                        <span>المقر الرئيسي في مصر</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 pr-7 leading-relaxed">
                                        {contact_info.address}
                                    </p>
                                </div>

                                <div className="border-t border-stone-100 dark:border-stone-800 pt-5">
                                    <div className="flex items-center gap-2.5 text-stone-900 dark:text-white font-bold text-base mb-1">
                                        <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span>البريد الإلكتروني التجاري الرسمي</span>
                                    </div>
                                    <a
                                        href={`mailto:${contact_info.commercial_email}`}
                                        className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-semibold pr-7 hover:underline"
                                        dir="ltr"
                                    >
                                        {contact_info.commercial_email}
                                    </a>
                                </div>

                                <div className="border-t border-stone-100 dark:border-stone-800 pt-5">
                                    <div className="flex items-center gap-2.5 text-stone-900 dark:text-white font-bold text-base mb-1">
                                        <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span>أرقام الهاتف والتواصل</span>
                                    </div>
                                    <div className="flex flex-col gap-1 pr-7 font-mono font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200">
                                        <a href="tel:01156231162" className="hover:text-amber-600 transition-colors inline-flex items-center gap-2">
                                            <span>01156231162</span>
                                            <span className="text-[10px] text-stone-400 font-sans">(خط رئيسي)</span>
                                        </a>
                                        <a href="tel:01044200583" className="hover:text-amber-600 transition-colors inline-flex items-center gap-2">
                                            <span>01044200583</span>
                                            <span className="text-[10px] text-stone-400 font-sans">(دعم مباشر)</span>
                                        </a>
                                    </div>
                                </div>

                                <div className="border-t border-stone-100 dark:border-stone-800 pt-5">
                                    <div className="flex items-center gap-2.5 text-stone-900 dark:text-white font-bold text-base mb-1">
                                        <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                                        <span>ساعات العمل الرسمية</span>
                                    </div>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 pr-7">
                                        {contact_info.working_hours}
                                    </p>
                                </div>

                                <div className="border-t border-stone-100 dark:border-stone-800 pt-5">
                                    <a
                                        href="https://wa.me/201220821706"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>محادثة واتساب فورية: 01220821706 (WhatsApp)</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-7">
                            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs">
                                <h2 className="text-xl font-display font-bold text-stone-900 dark:text-white mb-2">
                                    أرسلي لنا رسالة مباشرة
                                </h2>
                                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-6">
                                    يرجى ملء النموذج أدناه وسيقوم فريق خدمة العملاء بالتواصل معكِ في أسرع وقت.
                                </p>

                                {recentlySuccessful || flash?.success ? (
                                    <div className="p-4 mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <span>{flash?.success || 'تم استلام رسالتكِ بنجاح! سيتم الرد عليكِ في أقرب وقت.'}</span>
                                    </div>
                                ) : null}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                                الاسم الكامل *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-2.5 text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                                                placeholder="مثال: ياسمين أحمد"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                                البريد الإلكتروني *
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-2.5 text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                                                placeholder="your@email.com"
                                                dir="ltr"
                                                required
                                            />
                                            {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                                رقم الهاتف أو الواتساب
                                            </label>
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-2.5 text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                                                placeholder="010XXXXXXXX"
                                                dir="ltr"
                                            />
                                            {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                                موضوع الرسالة *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.subject}
                                                onChange={(e) => setData('subject', e.target.value)}
                                                className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-2.5 text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                                                placeholder="استفسار حجز / استرجاع / شكوى"
                                                required
                                            />
                                            {errors.subject && <p className="text-red-500 text-[11px] mt-1">{errors.subject}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                            نص الرسالة أو الاستفسار *
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-2.5 text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                                            placeholder="اكتبي تفاصيل استفساركِ هنا..."
                                            required
                                        />
                                        {errors.message && <p className="text-red-500 text-[11px] mt-1">{errors.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-black dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{processing ? 'جارٍ الإرسال...' : 'إرسال الرسالة إلى فريق الدعم'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
