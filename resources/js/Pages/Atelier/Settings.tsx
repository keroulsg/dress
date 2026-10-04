import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AtelierLayout from '@/Layouts/AtelierLayout';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Textarea } from '@/Components/UI/Textarea';
import { Badge } from '@/Components/UI/Badge';
import { Check, Settings as SettingsIcon, Store } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface SettingsProps {
    atelier: {
        id: number;
        business_name: string;
        slug: string;
        phone: string;
        whatsapp_number?: string;
        address: string;
        city: string;
        description: string;
        is_active: boolean;
        commission_rate: string;
    };
    kyc?: {
        is_verified: boolean;
        status: string;
        document_type?: string;
        rejection_reason?: string;
        submitted_at?: string;
    };
}

export default function AtelierSettings({ atelier, kyc }: SettingsProps) {
    const { tr } = useLanguage();

    const { data, setData, put, processing } = useForm({
        business_name: atelier.business_name,
        phone: atelier.phone,
        whatsapp_number: atelier.whatsapp_number ?? '',
        address: atelier.address,
        city: atelier.city,
        description: atelier.description,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/atelier/${atelier.id}/settings`, {
            preserveScroll: true,
        });
    };

    return (
        <AtelierLayout
            title={tr('إعدادات الأتيليه', 'Studio Settings')}
            breadcrumbs={[{ label: tr('الإعدادات', 'Settings') }]}
        >
            <Head title={`${tr('الإعدادات', 'Settings')} | ${atelier.business_name}`} />

            <div className="max-w-2xl space-y-6">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                        <div>
                            <h2 className="font-serif text-lg text-stone-900 dark:text-stone-100">
                                {tr('إعدادات وبيانات الأتيليه', 'Atelier Profile & Public Details')}
                            </h2>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                {tr(
                                    'المعلومات الظاهرة للمستأجرين في الكتالوج العام وصفحات الفساتين',
                                    'Public studio information displayed to renters in the storefront'
                                )}
                            </p>
                        </div>
                        <Badge tone={atelier.is_active ? 'success' : 'danger'}>
                            {atelier.is_active ? tr('المتجر مفعّل', 'Store Active') : tr('المتجر معطّل', 'Store Inactive')}
                        </Badge>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-stone-700 dark:text-stone-300 mb-1">
                                {tr('اسم الأتيليه / البراند', 'Atelier / Brand Name')}
                            </label>
                            <Input
                                value={data.business_name}
                                onChange={(e) => setData('business_name', e.target.value)}
                                className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('رقم الهاتف والتواصل', 'Contact Phone')}
                                </label>
                                <Input
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+20 100 000 0000"
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('المدينة', 'City')}
                                </label>
                                <Input
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Cairo, Alexandria, etc."
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-stone-700 dark:text-stone-300 mb-1">
                                {tr('رقم الواتساب للتواصل المباشر مع العميلات', 'WhatsApp Contact Number')}
                            </label>
                            <Input
                                value={data.whatsapp_number}
                                onChange={(e) => setData('whatsapp_number', e.target.value)}
                                placeholder="+20 100 000 0000"
                                className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 font-mono"
                            />
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                                {tr('يظهر رقم ومحادثة الواتساب للعميلة تلقائياً فور دفعها لعربون الحجز (10%).', 'WhatsApp chat button automatically unlocks for the customer once 10% deposit is paid.')}
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-stone-700 dark:text-stone-300 mb-1">
                                {tr('العنوان بالتفصيل', 'Detailed Address')}
                            </label>
                            <Input
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Zamalek, Cairo"
                                className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-stone-700 dark:text-stone-300 mb-1">
                                {tr('نبذة عن الأتيليه والخدمات', 'About the Atelier & Services')}
                            </label>
                            <Textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                placeholder={tr('دار أزياء متخصصة في أرقى فساتين السهرة والأعراس...', 'Haute couture house specializing in luxury evening and bridal gowns...')}
                                className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                            />
                        </div>

                        <div className="border-t border-stone-100 dark:border-stone-800 pt-4 flex justify-end">
                            <Button type="submit" variant="champagne" disabled={processing} className="text-xs">
                                <Check className="h-4 w-4 mr-1" />
                                {processing ? tr('جاري الحفظ…', 'Saving…') : tr('حفظ التغييرات', 'Save Changes')}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Atelier Owner KYC to Platform Admin Card */}
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                        <div>
                            <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                                {tr('توثيق الأتيليه لدى إدارة المنصة (Atelier KYC)', 'Atelier Official Verification (KYC)')}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                {tr('اعتماد بطاقة صاحبة الأتيليه والسجل التجاري / رخصة العمل الحر لدى الإدارة المركزية', 'Official approval of owner ID and commercial registration by Platform Admin')}
                            </p>
                        </div>
                        <Badge tone={kyc?.is_verified ? 'success' : kyc?.status === 'pending' ? 'warning' : 'neutral'}>
                            {kyc?.is_verified
                                ? tr('أتيليه موثق ومعتمد ✅', 'Verified Atelier ✅')
                                : kyc?.status === 'pending'
                                ? tr('قيد المراجعة ⏳', 'Pending Review ⏳')
                                : tr('غير موثق', 'Unverified')}
                        </Badge>
                    </div>

                    {kyc?.is_verified ? (
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-4 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                            {tr(
                                'تم اعتماد وتوثيق الأتيليه بنجاح من قِبل إدارة المنصة. تظهر شارة الأتيليه الموثق لكافة المستأجرات في الكتالوج العام وصفحات المعروضات.',
                                'Your atelier has been officially verified by the platform administration. The verified badge is displayed to all clients across the storefront.'
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3 text-xs text-stone-600 dark:text-stone-400">
                            <p>
                                {tr(
                                    'لرفع أو تحديث وثائق التوثيق الخاصة بصاحبة الأتيليه (بطاقة الرقم القومي والسجل التجاري)، يمكنك إرسالها لمدير المنصة مباشرة للمراجعة والاعتماد.',
                                    'To upload or update your atelier official verification documents (National ID & commercial license), submit them for review.'
                                )}
                            </p>
                            <Button asChild variant="outline" size="sm" className="text-xs">
                                <a href="/account/kyc">
                                    {tr('رفع / مراجعة وثائق الهوية الوطنية', 'Upload / Manage Verification Documents')} ↗
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AtelierLayout>
    );
}
