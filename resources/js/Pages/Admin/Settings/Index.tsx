import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Settings, Save, Shield, Percent, Clock, Lock, CheckCircle2, Receipt } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface Props {
    settings: {
        platform_commission_rate: number;
        default_escrow_deposit_percent: number;
        rental_buffer_days: number;
        auto_payout_threshold: number;
        require_kyc_for_booking: boolean;
        vat_enabled: boolean;
        vat_rate: number;
        maintenance_mode: boolean;
        support_email: string;
        support_phone: string;
    };
}

export default function SettingsIndex({ settings }: Props) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';

    const { data, setData, put, processing } = useForm({
        platform_commission_rate: settings.platform_commission_rate,
        default_escrow_deposit_percent: settings.default_escrow_deposit_percent,
        rental_buffer_days: settings.rental_buffer_days,
        require_kyc_for_booking: settings.require_kyc_for_booking,
        vat_enabled: settings.vat_enabled ?? false,
        vat_rate: settings.vat_rate ?? 0.14,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/settings');
    };

    return (
        <AdminLayout>
            <Head title={tr('إعدادات المنصة المركزية | Maison Admin', 'Platform Settings | Maison Admin')} />

            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                    {tr('إعدادات المنصة والسياسات المالية', 'Platform Settings & Financial Policies')}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {tr(
                        'التحكم في نسبة اقتطاع عمولة المنصة، نسب حجز التأمين، والضوابط التشغيلية المركزية',
                        'Configure platform commission, security deposit rates, and operational parameters'
                    )}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Form */}
                <div className="lg:col-span-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="border-b border-stone-100 dark:border-stone-800 pb-5">
                            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <Percent className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                                <span>{tr('السياسات المالية ونسب العمولات', 'Financial Policies & Commission')}</span>
                            </h2>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                {tr(
                                    'تطبق هذه النسب تلقائياً على كافة عقود الإيجار المنفذة بالمنصة',
                                    'These rates apply automatically to all rental agreements across the platform'
                                )}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                                    {tr('نسبة عمولة المنصة الأساسية (Platform Commission)', 'Platform Commission Rate')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={data.platform_commission_rate}
                                        onChange={(e) => setData('platform_commission_rate', parseFloat(e.target.value))}
                                        className={`w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:bg-white dark:focus:bg-stone-900 focus:outline-none`}
                                        required
                                    />
                                    <span className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-2.5 text-xs text-amber-700 dark:text-amber-400 font-mono font-bold`}>
                                        {(data.platform_commission_rate * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">
                                    {tr('القيمة الافتراضية 15% (0.15)', 'Default value 15% (0.15)')}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                                    {tr('نسبة التأمين المحتجز كأمانات (Escrow Deposit Rate)', 'Escrow Security Deposit Rate')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={data.default_escrow_deposit_percent}
                                        onChange={(e) => setData('default_escrow_deposit_percent', parseFloat(e.target.value))}
                                        className={`w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:bg-white dark:focus:bg-stone-900 focus:outline-none`}
                                        required
                                    />
                                    <span className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-2.5 text-xs text-amber-700 dark:text-amber-400 font-mono font-bold`}>
                                        {(data.default_escrow_deposit_percent * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">
                                    {tr('مسترد للعميل عند سلامة الفستان', 'Refunded upon verified dress return')}
                                </span>
                            </div>
                        </div>

                        {/* Value Added Tax (VAT) Governance Card */}
                        <div className="border border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50/70 dark:bg-stone-800/50 p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-700/80 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Receipt className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                                        <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                                            {tr('ضريبة القيمة المضافة (14% VAT)', 'Value Added Tax (14% VAT)')}
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                                        {tr(
                                            'التحكم في تفعيل أو إخفاء ضريبة القيمة المضافة من فواتير وحسابات العملاء.',
                                            'Control whether Value Added Tax is computed and charged on customer invoices.'
                                        )}
                                    </p>
                                </div>

                                {/* Toggle Switch */}
                                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={data.vat_enabled}
                                        onChange={(e) => setData('vat_enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    <span className={`text-xs font-bold text-stone-900 dark:text-stone-100 ${isRtl ? 'mr-3' : 'ml-3'}`}>
                                        {data.vat_enabled ? tr('مفعلة', 'Enabled') : tr('معطلة', 'Disabled')}
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div>
                                    {data.vat_enabled ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                            <span>{tr('الضريبة مفعلة حالياً — يتم احتساب 14% وإضافتها للفواتير', 'VAT Active — 14% added to checkout')}</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold text-[11px]">
                                            <span>⚪</span>
                                            <span>{tr('الضريبة مخفية ومعطلة حالياً — الأسعار صافية 100% بدون أي ضريبة مضافة', 'VAT Disabled & Hidden — 100% net prices without extra tax')}</span>
                                        </span>
                                    )}
                                    <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1.5">
                                        {tr(
                                            'تم تعطيل الضريبة لجعل الحسابات واضحة وبسيطة للمستأجرات. يمكنك تفعيلها مستقبلاً عند بدء السداد الضريبي الرسمي للمنصة.',
                                            'Disabled to keep calculations simple for brides. You can re-enable anytime when ready to pay official taxes.'
                                        )}
                                    </p>
                                </div>

                                {data.vat_enabled && (
                                    <div className="w-36 shrink-0">
                                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                            {tr('نسبة الضريبة', 'Tax Rate')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                value={data.vat_rate}
                                                onChange={(e) => setData('vat_rate', parseFloat(e.target.value))}
                                                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs font-mono font-bold text-stone-900 dark:text-stone-100"
                                            />
                                            <span className={`absolute ${isRtl ? 'left-2.5' : 'right-2.5'} top-2 text-xs font-bold text-amber-700 font-mono`}>
                                                {(data.vat_rate * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-b border-stone-100 dark:border-stone-800 pb-5 pt-3">
                            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                                <span>{tr('الضوابط التشغيلية وأيام الصيانة', 'Operational Controls & Buffer Days')}</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                                    {tr('أيام العزل والصيانة بين الحجوزات (Buffer Days)', 'Buffer Days Between Bookings')}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="14"
                                    value={data.rental_buffer_days}
                                    onChange={(e) => setData('rental_buffer_days', parseInt(e.target.value))}
                                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:bg-white dark:focus:bg-stone-900 focus:outline-none"
                                    required
                                />
                                <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">
                                    {tr('أيام مخصصة للغسيل الجاف والكي والفحص', 'Dedicated days for dry cleaning, ironing, and inspection')}
                                </span>
                            </div>

                            <div className="flex items-center pt-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.require_kyc_for_booking}
                                        onChange={(e) => setData('require_kyc_for_booking', e.target.checked)}
                                        className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <div>
                                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                                            {tr('إلزامية توثيق الهوية (KYC)', 'Mandatory Identity Verification (KYC)')}
                                        </span>
                                        <span className="text-[10px] text-stone-400 dark:text-stone-500 block">
                                            {tr('منع الحجز إلا بعد اعتماد بطاقة الرقم القومي', 'Prevent bookings until national ID is verified')}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-6 py-2.5 text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                <span>{processing ? tr('جاري الحفظ…', 'Saving…') : tr('حفظ التعديلات وتطبيقها', 'Save & Enforce')}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Info Box */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-3 text-amber-700 dark:text-amber-400">
                            <Shield className="h-5 w-5" />
                            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                                {tr('معايير الأمان المالي', 'Financial Security Standards')}
                            </h3>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                            {tr(
                                'جميع القيود المزدوجة ونسب الإيرادات تخضع لقواعد المحاسبة المتوافقة مع المعايير الدولية، مع الفصل التام بين حسابات الأمانات وحسابات أرباح المنصة.',
                                'All double-entry journals and revenue ratios comply with international accounting standards, with strict segregation between escrow deposits and platform operating revenue.'
                            )}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-3 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                                {tr('حالة النظام الحالي', 'System Health Status')}
                            </h3>
                        </div>
                        <ul className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                            <li className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                                <span className="text-stone-400 dark:text-stone-500">{tr('نمط الصيانة:', 'Maintenance Mode:')}</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                    {tr('غير مفعل (المتجر متاح)', 'Disabled (Storefront Live)')}
                                </span>
                            </li>
                            <li className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                                <span className="text-stone-400 dark:text-stone-500">{tr('بريد الدعم الفني:', 'Support Email:')}</span>
                                <span className="font-mono text-stone-600 dark:text-stone-300">{settings.support_email}</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-stone-400 dark:text-stone-500">{tr('هاتف الطوارئ:', 'Hotline:')}</span>
                                <span className="font-mono text-stone-600 dark:text-stone-300">{settings.support_phone}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
