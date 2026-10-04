import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, ShoppingBag, Sparkles, Store } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Register() {
    const { tr } = useLanguage();
    const [selectedRole, setSelectedRole] = useState<'renter' | 'atelier_owner'>('renter');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'renter' as 'renter' | 'atelier_owner',
        business_name: '',
        store_type: 'bridal_atelier',
        agree_to_terms: true,
    });

    const handleRoleSelect = (role: 'renter' | 'atelier_owner') => {
        setSelectedRole(role);
        setData('role', role);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={tr('إنشاء حساب جديد | Maison Rentale', 'Create Account | Maison Rentale')} />

            <div className="mb-6 text-center">
                <p className="text-xs uppercase font-semibold tracking-widest text-rose-600 dark:text-rose-400">
                    {tr('منصة الهوت كوتور', 'Haute Couture Platform')}
                </p>
                <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 mt-1">
                    {tr('إنشاء حساب جديد في ميزون رنتال', 'Join Maison Rentale')}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {tr('اختاري نوع الحساب لتخصيص تجربتك بالكامل', 'Choose account type to customize your journey')}
                </p>
            </div>

            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => handleRoleSelect('renter')}
                    className={`relative flex flex-col items-start p-4 rounded-2xl border-2 text-start transition-all ${
                        selectedRole === 'renter'
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 shadow-xs'
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                >
                    <div className="flex w-full items-center justify-between mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 dark:bg-stone-800 text-amber-300">
                            <ShoppingBag className="h-4 w-4" />
                        </div>
                        {selectedRole === 'renter' && <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                    </div>
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {tr('مشترية / مستأجرة (Customer)', 'Renter / Client')}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {tr('استئجار فساتين الهوت كوتور وتوصيلها حتى بابك', 'Rent haute couture gowns delivered to your door')}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => handleRoleSelect('atelier_owner')}
                    className={`relative flex flex-col items-start p-4 rounded-2xl border-2 text-start transition-all ${
                        selectedRole === 'atelier_owner'
                            ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 shadow-xs'
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                >
                    <div className="flex w-full items-center justify-between mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 dark:bg-stone-800 text-amber-400">
                            <Store className="h-4 w-4" />
                        </div>
                        {selectedRole === 'atelier_owner' && (
                            <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        )}
                    </div>
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {tr('صاحبة فستان / مشغل (Atelier)', 'Atelier / Designer')}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {tr('عرض الفساتين وإدارة الحجوزات ولوحة الأرباح', 'List couture pieces, manage calendar, & track payouts')}
                    </span>
                </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {selectedRole === 'atelier_owner' && (
                    <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-4 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100">
                            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{tr('بيانات المتجر أو البراند', 'Store & Brand Details')}</span>
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="business_name"
                                value={tr('اسم المتجر / الأتيليه / البراند (Store Name)', 'Store or Brand Name')}
                                className="dark:text-stone-300 text-xs"
                            />
                            <TextInput
                                id="business_name"
                                name="business_name"
                                value={data.business_name}
                                className="mt-1 block w-full bg-white dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 rounded-xl"
                                placeholder={tr('مثال: Maison Noor Couture', 'e.g. Maison Noor Couture')}
                                onChange={(e) => setData('business_name', e.target.value)}
                                required={selectedRole === 'atelier_owner'}
                            />
                            <InputError message={errors.business_name} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="store_type"
                                value={tr('تصنيف وتخصص المتجر (Store Specialty)', 'Store Specialty')}
                                className="dark:text-stone-300 text-xs"
                            />
                            <select
                                id="store_type"
                                name="store_type"
                                value={data.store_type}
                                onChange={(e) => setData('store_type', e.target.value)}
                                className="mt-1 block w-full bg-white dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 rounded-xl text-xs py-2 px-3 border border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                            >
                                <option value="bridal_atelier">{tr('أتيليه فساتين زفاف وسهرة (Bridal & Evening Atelier)', 'Bridal & Evening Atelier')}</option>
                                <option value="fashion_boutique">{tr('بوتيك أزياء ومناسبات راقية (Fashion Boutique)', 'Fashion Boutique')}</option>
                                <option value="abaya_designer">{tr('براند عبايات وقفاطين فاخرة (Abaya & Kaftan Brand)', 'Abaya & Kaftan Brand')}</option>
                                <option value="accessories_brand">{tr('مجوهرات وإكسسوارات زفاف ومناسبات (Bridal Jewelry & Accessories)', 'Bridal Jewelry & Accessories')}</option>
                                <option value="occasions_hub">{tr('مركز متكامل لمستلزمات المناسبات (Occasions Hub)', 'Occasions Hub')}</option>
                            </select>
                        </div>
                    </div>
                )}

                <div>
                    <InputLabel
                        htmlFor="name"
                        value={tr('الاسم الكامل / Full Name', 'Full Name')}
                        className="dark:text-stone-300"
                    />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full bg-stone-50 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 rounded-xl"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={tr('الاسم الثلاثي', 'Your Full Name')}
                        required
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="email"
                        value={tr('البريد الإلكتروني / Email', 'Email Address')}
                        className="dark:text-stone-300"
                    />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-stone-50 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 rounded-xl"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="yourname@example.com"
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="phone"
                        value={tr('رقم الهاتف أو الواتساب / Phone Number', 'Phone or WhatsApp Number')}
                        className="dark:text-stone-300"
                    />
                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full bg-stone-50 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 rounded-xl"
                        autoComplete="tel"
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="01xxxxxxxxx / +966xxxxxxxxx"
                    />
                    <InputError message={errors.phone} className="mt-1" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value={tr('كلمة المرور / Password', 'Password')}
                        className="dark:text-stone-300"
                    />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-stone-50 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 rounded-xl"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value={tr('تأكيد كلمة المرور / Confirm Password', 'Confirm Password')}
                        className="dark:text-stone-300"
                    />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full bg-stone-50 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700 rounded-xl"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                    <input
                        id="agree_to_terms"
                        type="checkbox"
                        checked={data.agree_to_terms}
                        onChange={(e) => setData('agree_to_terms', e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500 dark:border-stone-700 dark:bg-stone-800"
                        required
                    />
                    <label htmlFor="agree_to_terms" className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed cursor-pointer">
                        {tr(
                            'أوافق على ',
                            'I agree to the '
                        )}
                        <Link href="/terms" target="_blank" className="font-semibold text-rose-600 dark:text-rose-400 underline hover:text-rose-700">
                            {tr('شروط الاستخدام وضمان التأمين', 'Terms of Service & Deposit Guarantee')}
                        </Link>
                        {tr(' و ', ' and ')}
                        <Link href="/privacy" target="_blank" className="font-semibold text-rose-600 dark:text-rose-400 underline hover:text-rose-700">
                            {tr('سياسة الخصوصية', 'Privacy Policy')}
                        </Link>
                    </label>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                    <PrimaryButton
                        className="w-full justify-center py-3 bg-stone-900 dark:bg-amber-600 text-white hover:bg-black dark:hover:bg-amber-700 font-medium text-sm rounded-xl"
                        disabled={processing}
                    >
                        {processing
                            ? tr('جاري إنشاء الحساب…', 'Creating Account…')
                            : selectedRole === 'atelier_owner'
                              ? tr('إنشاء حساب الأتيليه والانتقال للاستوديو', 'Register Atelier & Open Studio')
                              : tr('إنشاء الحساب وبدء التصفح', 'Create Account & Start Browsing')}
                    </PrimaryButton>

                    <div className="text-center pt-2 border-t border-stone-200 dark:border-stone-800">
                        <Link
                            href={route('login')}
                            className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline"
                        >
                            {tr('لديكِ حساب بالفعل؟ تسجيل الدخول', 'Already have an account? Sign in')}
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
