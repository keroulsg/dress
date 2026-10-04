import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CreditCard,
    FileText,
    Heart,
    Home,
    MessageSquare,
    Scale,
    ShieldCheck,
    User as UserIcon,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';

import { ToastProvider } from '../Components/Feedback/Toast';
import { LanguageProvider, useLanguage } from '../Contexts/LanguageContext';
import { LanguageSwitcher } from '../Components/UI/LanguageSwitcher';
import { ThemeToggle } from '../Components/UI/ThemeToggle';
import { cn } from '../Lib/utils';
import { Badge } from '../Components/UI/Badge';
import type { AuthUser } from '../Lib/permissions';

function CustomerLayoutInner({ children }: PropsWithChildren) {
    const { props, url } = usePage();
    const auth = props.auth as { user: AuthUser | null };
    const pageUrl = url;
    const { t, isRtl } = useLanguage();

    const navItems = [
        { labelKey: 'customer.nav.overview', href: '/account', icon: Home },
        { labelKey: 'customer.nav.bookings', href: '/account/bookings', icon: CalendarDays },
        { labelKey: 'customer.nav.saved', href: '/account/saved', icon: Heart },
        { labelKey: 'customer.nav.payments', href: '/account/payments', icon: CreditCard },
        { labelKey: 'customer.nav.disputes', href: '/account/disputes', icon: Scale },
        { labelKey: 'customer.nav.reviews', href: '/account/reviews', icon: MessageSquare },
        { labelKey: 'customer.nav.verification', href: '/account/kyc', icon: ShieldCheck },
        { labelKey: 'customer.nav.profile', href: '/account/profile', icon: UserIcon },
    ];

    return (
        <div className="min-h-screen bg-[#f9f8f6] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100">
            <header className="border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 sticky top-0 z-20 shadow-xs backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
                    <Link href="/" className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                        Maison <span className="text-amber-700 dark:text-amber-400">Rentale</span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Day / Night Mode Toggle */}
                        <ThemeToggle />

                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {auth.user?.permissions?.includes('kyc.verified') ? (
                            <Badge tone="success">
                                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                                {t('customer.kyc_verified')}
                            </Badge>
                        ) : (
                            <Link href="/account/kyc" className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200">
                                {t('customer.kyc_pending')}
                            </Link>
                        )}

                        <Link href="/" className="text-xs font-semibold text-stone-600 dark:text-stone-400 transition-colors hover:text-amber-700 dark:hover:text-amber-400">
                            {t('common.back_to_store')} ↗
                        </Link>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row lg:px-8">
                <nav aria-label="Account navigation" className="lg:w-60 lg:shrink-0">
                    <p className="mb-2 hidden text-xs font-bold uppercase tracking-wider text-stone-400 font-mono lg:block">
                        {t('customer.title.overview')}
                    </p>
                    <div className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible">
                        {navItems.map((item) => {
                            const active = pageUrl.startsWith(item.href);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all',
                                        active
                                            ? 'bg-stone-900 dark:bg-amber-950/60 text-amber-300 dark:text-amber-400 border border-transparent dark:border-amber-500/30 shadow-xs'
                                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100',
                                    )}
                                    aria-current={active ? 'page' : undefined}
                                >
                                    <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-amber-400' : 'text-stone-400 dark:text-stone-500')} aria-hidden="true" />
                                    <span>{t(item.labelKey)}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-4 hidden border-t border-stone-200 dark:border-stone-800 pt-4 text-xs text-stone-500 dark:text-stone-400 lg:block">
                        <p className="mb-0.5 font-bold text-stone-900 dark:text-stone-100">{auth.user?.name}</p>
                        <p className="truncate font-mono text-[11px] text-stone-400 dark:text-stone-500">{auth.user?.email}</p>
                        <Link href="/logout" method="post" as="button" className="mt-3 inline-block text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors">
                            {t('common.logout')}
                        </Link>
                    </div>
                </nav>

                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}

export default function CustomerLayout({ children }: PropsWithChildren) {
    return (
        <ToastProvider>
            <CustomerLayoutInner>{children}</CustomerLayoutInner>
        </ToastProvider>
    );
}