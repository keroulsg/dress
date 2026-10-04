import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import LanguageSwitcher from '@/Components/UI/LanguageSwitcher';
import { useLanguage } from '@/Contexts/LanguageContext';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export default function Guest({ children }: PropsWithChildren) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';

    return (
        <div className="flex min-h-screen flex-col bg-[#faf8f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">
            {/* Top Bar with Language, Theme, & Back link */}
            <header className="w-full px-6 py-4 flex items-center justify-between border-b border-stone-200/70 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/70 backdrop-blur">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                    {isRtl ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                    <span>{tr('العودة للمتجر العام', 'Back to Storefront')}</span>
                </Link>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Auth Card Container */}
            <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6">
                <div className="mb-6 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <span className="font-serif text-2xl font-bold tracking-widest uppercase text-stone-900 dark:text-stone-100">
                            Maison
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-sans border border-amber-300 dark:border-amber-700/60 px-1.5 py-0.5 rounded">
                            Rentale
                        </span>
                    </Link>
                </div>

                <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
