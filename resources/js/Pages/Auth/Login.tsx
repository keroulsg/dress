import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { KeyRound, ShieldAlert, ShieldCheck, ShoppingBag, Sparkles, Store } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { tr } = useLanguage();
    const [fastLoggingIn, setFastLoggingIn] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const immediateLogin = (email: string) => {
        setFastLoggingIn(email);
        router.post(
            route('login'),
            {
                email,
                password: 'password',
                remember: true,
            },
            {
                onFinish: () => setFastLoggingIn(null),
            }
        );
    };

    return (
        <GuestLayout>
            <Head title={tr('تسجيل الدخول | Maison Rentale', 'Log In | Maison Rentale')} />

            <div className="mb-6 text-center">
                <p className="text-xs uppercase font-semibold tracking-widest text-rose-600 dark:text-rose-400">Maison Rentale</p>
                <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 mt-1">
                    {tr('تسجيل الدخول إلى حسابك', 'Sign in to Your Account')}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {tr('مرحباً بك مجدداً في منصة تأجير فساتين الهوت كوتور', 'Welcome back to the luxury haute couture rental platform')}
                </p>
            </div>

            {status && (
                <div className="mb-6 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3.5 text-xs text-stone-800 dark:text-stone-200 flex items-start gap-2.5 animate-in fade-in">
                    <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{status}</span>
                </div>
            )}

            {/* Quick 1-Click Instant Logins */}
            <div className="mb-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 p-3.5">
                <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                    <KeyRound className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{tr('دخول فوري تجريبي بنقرة واحدة (1-Click Login)', '1-Click Fast Login for Testing')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                        type="button"
                        disabled={!!fastLoggingIn || processing}
                        onClick={() => immediateLogin('admin@dress.test')}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-stone-900 hover:border-rose-500 transition-all text-center group shadow-xs disabled:opacity-50"
                    >
                        <ShieldCheck className="h-4 w-4 text-rose-600 dark:text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-semibold text-stone-900 dark:text-stone-100">
                            {fastLoggingIn === 'admin@dress.test' ? tr('جاري الدخول…', 'Logging in…') : tr('مدير المنصة', 'Super Admin')}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400 truncate max-w-full">admin@dress.test</span>
                        <span className="mt-1 text-[8px] text-rose-600 dark:text-rose-400 font-semibold">
                            {tr('➔ لوحة الإدارة', '➔ Admin Console')}
                        </span>
                    </button>

                    <button
                        type="button"
                        disabled={!!fastLoggingIn || processing}
                        onClick={() => immediateLogin('owner0@dress.test')}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-white dark:bg-stone-900 hover:border-amber-500 transition-all text-center group shadow-xs disabled:opacity-50"
                    >
                        <Store className="h-4 w-4 text-amber-600 dark:text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-semibold text-stone-900 dark:text-stone-100">
                            {fastLoggingIn === 'owner0@dress.test' ? tr('جاري الدخول…', 'Logging in…') : tr('صاحبة أتيليه', 'Atelier Owner')}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400 truncate max-w-full">owner0@dress.test</span>
                        <span className="mt-1 text-[8px] text-amber-600 dark:text-amber-400 font-semibold">
                            {tr('➔ استوديو الأتيليه', '➔ Atelier Studio')}
                        </span>
                    </button>

                    <button
                        type="button"
                        disabled={!!fastLoggingIn || processing}
                        onClick={() => immediateLogin('renter0@dress.test')}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-stone-900 hover:border-emerald-500 transition-all text-center group shadow-xs disabled:opacity-50"
                    >
                        <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-semibold text-stone-900 dark:text-stone-100">
                            {fastLoggingIn === 'renter0@dress.test' ? tr('جاري الدخول…', 'Logging in…') : tr('مستأجرة / عميلة', 'Renter Client')}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400 truncate max-w-full">renter0@dress.test</span>
                        <span className="mt-1 text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            {tr('➔ المتجر العام', '➔ Storefront')}
                        </span>
                    </button>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
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
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="example@dress.test"
                        required
                    />

                    <InputError message={errors.email} className="mt-1" />
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
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                        />
                        <span className="ms-2 text-stone-500 dark:text-stone-400">
                            {tr('تذكرني على هذا الجهاز', 'Remember me')}
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-stone-500 dark:text-stone-400 underline hover:text-stone-900 dark:hover:text-stone-100"
                        >
                            {tr('نسيت كلمة المرور؟', 'Forgot Password?')}
                        </Link>
                    )}
                </div>

                <div className="pt-2 flex flex-col gap-3">
                    <PrimaryButton
                        className="w-full justify-center py-3 bg-stone-900 dark:bg-amber-600 text-white hover:bg-black dark:hover:bg-amber-700 font-medium text-sm rounded-xl"
                        disabled={processing || !!fastLoggingIn}
                    >
                        {processing ? tr('جاري التحقق…', 'Signing in…') : tr('تسجيل الدخول (Sign in)', 'Sign in')}
                    </PrimaryButton>

                    <div className="text-center pt-2 border-t border-stone-200 dark:border-stone-800">
                        <Link
                            href={route('register')}
                            className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline"
                        >
                            {tr(
                                'ليس لديك حساب بعد؟ إنشاء حساب جديد (صاحبة أتيليه أو مستأجرة)',
                                "Don't have an account? Register as Atelier or Client"
                            )}
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
