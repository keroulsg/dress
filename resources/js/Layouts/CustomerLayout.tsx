import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CreditCard,
    FileText,
    Heart,
    Home,
    LogOut,
    Menu,
    MessageSquare,
    Scale,
    ShieldCheck,
    Store,
    User as UserIcon,
    X,
} from 'lucide-react';
import React, { useState, type PropsWithChildren } from 'react';

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
    const { t, tr, isRtl } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { labelKey: 'customer.nav.overview', labelAr: 'نظرة عامة', href: '/account', icon: Home },
        { labelKey: 'customer.nav.bookings', labelAr: 'الحجوزات والطلبات', href: '/account/bookings', icon: CalendarDays },
        { labelKey: 'customer.nav.saved', labelAr: 'القطع المحفوظة', href: '/account/saved', icon: Heart },
        { labelKey: 'customer.nav.payments', labelAr: 'المدفوعات والتأمين', href: '/account/payments', icon: CreditCard },
        { labelKey: 'customer.nav.disputes', labelAr: 'الشكاوى والنزاعات', href: '/account/disputes', icon: Scale },
        { labelKey: 'customer.nav.reviews', labelAr: 'التقييمات والآراء', href: '/account/reviews', icon: MessageSquare },
        { labelKey: 'customer.nav.verification', labelAr: 'توثيق الهوية (KYC)', href: '/account/kyc', icon: ShieldCheck },
        { labelKey: 'customer.nav.profile', labelAr: 'الملف الشخصي', href: '/account/profile', icon: UserIcon },
    ];

    const bottomTabs = [
        { href: '/account', label: tr('الرئيسية', 'Overview'), icon: Home },
        { href: '/account/bookings', label: tr('حجوزاتي', 'Bookings'), icon: CalendarDays },
        { href: '/account/saved', label: tr('المفضلة', 'Saved'), icon: Heart },
        { href: '/account/payments', label: tr('المدفوعات', 'Payments'), icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-[#f9f8f6] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 flex flex-col font-sans antialiased">
            {/* Top Navigation Header */}
            <header className="border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 sticky top-0 z-20 shadow-xs backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2.5 sm:gap-4">
                        {/* Mobile & Tablet Drawer Trigger Button */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 lg:hidden transition-colors"
                            aria-label="Open navigation menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <Link href="/" className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <span>Maison</span>
                            <span className="text-amber-700 dark:text-amber-400">Rentale</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-3">
                        {/* Day / Night Mode Toggle */}
                        <ThemeToggle />

                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* Verification Badge */}
                        {auth.user?.permissions?.includes('kyc.verified') ? (
                            <Badge tone="success" className="hidden sm:inline-flex text-[11px]">
                                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                                <span>{t('customer.kyc_verified')}</span>
                            </Badge>
                        ) : (
                            <Link
                                href="/account/kyc"
                                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors"
                            >
                                <ShieldCheck className="h-3 w-3" />
                                <span>{t('customer.kyc_pending')}</span>
                            </Link>
                        )}

                        {/* Back to Storefront Link */}
                        <Link
                            href="/"
                            className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors flex items-center gap-1"
                        >
                            <Store className="h-3.5 w-3.5 sm:hidden" />
                            <span className="hidden sm:inline">{t('common.back_to_store')}</span>
                            <span className="font-mono text-[10px] hidden sm:inline">↗</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile / Tablet Slide-over Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Drawer Panel */}
                    <aside
                        className={cn(
                            'fixed inset-y-0 w-72 max-w-[85vw] bg-white dark:bg-stone-950 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto border-stone-200 dark:border-stone-800 animate-in duration-200',
                            isRtl ? 'right-0 border-l slide-in-from-right' : 'left-0 border-r slide-in-from-left',
                        )}
                    >
                        <div>
                            {/* Drawer Header with User Card */}
                            <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-serif font-bold text-base shadow-xs">
                                        {auth.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                                            {auth.user?.name || tr('عميل ميزون', 'Client')}
                                        </p>
                                        <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono truncate">
                                            {auth.user?.email}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMobileOpen(false)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* KYC Status Pill in Drawer */}
                            <div className="mb-4">
                                {auth.user?.permissions?.includes('kyc.verified') ? (
                                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                        <span>{t('customer.kyc_verified')}</span>
                                    </div>
                                ) : (
                                    <Link
                                        href="/account/kyc"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 text-xs text-amber-900 dark:text-amber-300 font-medium hover:bg-amber-100 transition-colors"
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <ShieldCheck className="h-4 w-4 text-amber-600" />
                                            <span>{t('customer.kyc_pending')}</span>
                                        </span>
                                        <span className="text-[10px] uppercase font-bold text-amber-600">{tr('توثيق الآن ➔', 'Verify ➔')}</span>
                                    </Link>
                                )}
                            </div>

                            {/* Navigation List */}
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const active = pageUrl.startsWith(item.href);
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all',
                                                active
                                                    ? 'bg-stone-900 dark:bg-amber-950/70 text-amber-300 dark:text-amber-400 border border-transparent dark:border-amber-500/40 shadow-xs'
                                                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100',
                                            )}
                                        >
                                            <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-amber-400' : 'text-stone-400 dark:text-stone-500')} />
                                            <span className="truncate">{t(item.labelKey)}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Drawer Bottom Actions */}
                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
                            <Link
                                href="/"
                                className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-3.5 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-600 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Store className="h-4 w-4 text-amber-600" />
                                    <span>{t('common.back_to_store')}</span>
                                </span>
                                <span>↗</span>
                            </Link>

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-rose-400 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>{t('common.logout')}</span>
                            </Link>
                        </div>
                    </aside>
                </div>
            )}

            {/* Layout Body Container (Laptop / Desktop Sidebar + Responsive Content Area) */}
            <div className="mx-auto flex max-w-7xl flex-1 w-full gap-8 px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Desktop / Laptop Sidebar (>= 1024px) */}
                <nav aria-label="Account navigation" className="hidden lg:block lg:w-64 lg:shrink-0 sticky top-24 self-start">
                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-xs">
                        <div className="mb-4 pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-serif font-bold text-sm shadow-xs">
                                {auth.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                                    {auth.user?.name || tr('عميل ميزون', 'Client')}
                                </p>
                                <p className="text-[10px] text-stone-400 dark:text-stone-500 font-mono truncate">
                                    {auth.user?.email}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const active = pageUrl.startsWith(item.href);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all',
                                            active
                                                ? 'bg-stone-900 dark:bg-amber-950/70 text-amber-300 dark:text-amber-400 border border-transparent dark:border-amber-500/40 shadow-xs'
                                                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100',
                                        )}
                                        aria-current={active ? 'page' : undefined}
                                    >
                                        <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-amber-400' : 'text-stone-400 dark:text-stone-500')} aria-hidden="true" />
                                        <span className="truncate">{t(item.labelKey)}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-rose-400 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>{t('common.logout')}</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area */}
                <main className="min-w-0 flex-1 pb-20 sm:pb-6">{children}</main>
            </div>

            {/* Mobile Bottom Quick Dock Navigation (Smart Phone Bar) */}
            <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-stone-950/95 border-t border-stone-200 dark:border-stone-800 backdrop-blur-md shadow-lg px-2 py-1.5 safe-area-bottom">
                <div className="grid grid-cols-5 items-center justify-around">
                    {bottomTabs.map((tab) => {
                        const active = pageUrl === tab.href || (tab.href !== '/account' && pageUrl.startsWith(tab.href));
                        const Icon = tab.icon;

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    'flex flex-col items-center justify-center py-1 rounded-xl transition-all',
                                    active
                                        ? 'text-amber-700 dark:text-amber-400 font-bold'
                                        : 'text-stone-400 dark:text-stone-500 hover:text-stone-700',
                                )}
                            >
                                <Icon className={cn('h-5 w-5', active ? 'stroke-[2.5]' : 'stroke-[1.8]')} />
                                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">{tab.label}</span>
                            </Link>
                        );
                    })}

                    {/* 5th button: Toggle All Menu */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="flex flex-col items-center justify-center py-1 rounded-xl text-stone-400 dark:text-stone-500 hover:text-stone-700"
                    >
                        <Menu className="h-5 w-5 stroke-[1.8]" />
                        <span className="text-[10px] mt-0.5 tracking-tight">{tr('المزيد', 'More')}</span>
                    </button>
                </div>
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