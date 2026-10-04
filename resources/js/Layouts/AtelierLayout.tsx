import { Link, usePage } from '@inertiajs/react';
import React, { useState, PropsWithChildren } from 'react';
import {
    CalendarDays,
    ClipboardCheck,
    Images,
    LayoutDashboard,
    Menu,
    Plus,
    Store,
    Wallet,
} from 'lucide-react';

import { ToastProvider } from '../Components/Feedback/Toast';
import { AtelierSidebar } from '../Components/Navigation/AtelierSidebar';
import { Breadcrumbs, type Crumb } from '../Components/Navigation/Breadcrumbs';
import { LanguageProvider, useLanguage } from '../Contexts/LanguageContext';
import { LanguageSwitcher } from '../Components/UI/LanguageSwitcher';
import { ThemeToggle } from '../Components/UI/ThemeToggle';
import type { AtelierScope } from '../types/contracts';
import { cn } from '../Lib/utils';

export interface AtelierLayoutProps extends PropsWithChildren {
    breadcrumbs?: Crumb[];
    title?: string;
}

function AtelierLayoutInner({ children, breadcrumbs = [], title }: AtelierLayoutProps) {
    const { atelier, url } = usePage().props as unknown as { atelier?: AtelierScope | null; url?: string };
    const { t, tr, isRtl } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const scope = atelier ?? null;
    const atelierId = (scope as any)?.id ?? 1;

    const bottomTabs = [
        { href: `/atelier/${atelierId}`, label: tr('الرئيسية', 'Overview'), icon: LayoutDashboard },
        { href: `/atelier/${atelierId}/dresses`, label: tr('المعروضات', 'Catalog'), icon: Images },
        { href: `/atelier/${atelierId}/bookings`, label: tr('الطلبات', 'Bookings'), icon: CalendarDays },
        { href: `/atelier/${atelierId}/calendar`, label: tr('التقويم', 'Calendar'), icon: CalendarDays },
    ];

    return (
        <div className="min-h-screen bg-[#f9f8f6] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 flex font-sans antialiased">
            {/* Sidebar (Desktop fixed & Mobile/Tablet slide-over drawer) */}
            <AtelierSidebar
                atelierId={atelierId}
                businessName={scope?.business_name ?? (isRtl ? 'أتيليه ميزون' : 'My Atelier')}
                storeActive={scope?.is_active ?? true}
                roleBadge={scope?.staff_role ?? (isRtl ? 'مالك الأتيليه' : 'Owner')}
                user={{ name: '' }}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            {/* Main Content Area (Offset adaptively based on RTL / LTR without flex spacer collision) */}
            <div
                className={cn(
                    'flex min-w-0 flex-1 flex-col transition-all duration-200',
                    isRtl ? 'lg:mr-64 lg:ml-0' : 'lg:ml-64 lg:mr-0',
                )}
            >
                {/* Header */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 px-3 sm:px-6 lg:px-8 backdrop-blur shadow-xs">
                    <div className="flex items-center gap-2.5 sm:gap-4">
                        {/* Mobile & Tablet Hamburger Button */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="rounded-xl p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-900 lg:hidden transition-colors"
                            aria-label="Open sidebar menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="hidden sm:block">
                            <Breadcrumbs items={breadcrumbs} homeHref={`/atelier/${atelierId}`} />
                        </div>

                        {/* Mobile Brand / Title Fallback */}
                        <div className="sm:hidden font-serif text-sm font-bold text-stone-900 dark:text-stone-100 truncate max-w-[150px]">
                            {title || scope?.business_name || 'Atelier'}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-3">
                        {/* Quick Add Dress Button */}
                        <Link
                            href={`/atelier/${atelierId}/dresses/new`}
                            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{tr('إضافة قطعة جديدة', 'Add New Piece')}</span>
                            <span className="sm:hidden">{tr('إضافة', 'Add')}</span>
                        </Link>

                        {/* Day / Night Theme Toggle */}
                        <ThemeToggle />

                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* Storefront Link */}
                        <Link
                            href="/"
                            className="hidden text-xs font-semibold text-stone-600 dark:text-stone-400 transition-colors hover:text-amber-700 dark:hover:text-amber-400 sm:flex items-center gap-1"
                        >
                            <span>{t('common.storefront')}</span>
                            <span className="font-mono text-[10px]">↗</span>
                        </Link>
                    </div>
                </header>

                {/* Page Title if specified */}
                {title && (
                    <div className="border-b border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-950/50 px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4">
                        <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">{title}</h1>
                    </div>
                )}

                {/* Main Content Container */}
                <main className="flex-1 px-3 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-7xl w-full mx-auto pb-24 sm:pb-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="hidden sm:block border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-6 py-4 text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
                        <p>© {new Date().getFullYear()} Maison Rentale. {isRtl ? 'لوحة تحكم الأتيليه والشركاء' : 'Atelier & Designer Studio'}</p>
                        <p className="font-mono text-[11px] text-stone-400 dark:text-stone-500">Maison Haute Couture Platform</p>
                    </div>
                </footer>
            </div>

            {/* Mobile Bottom Quick Dock Navigation (Smart Phone Bar) */}
            <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-stone-950/95 border-t border-stone-200 dark:border-stone-800 backdrop-blur-md shadow-lg px-2 py-1.5 safe-area-bottom">
                <div className="grid grid-cols-5 items-center justify-around">
                    {bottomTabs.map((tab) => {
                        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
                        const active = currentPath === tab.href || (tab.href !== `/atelier/${atelierId}` && currentPath.startsWith(tab.href));
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

                    {/* 5th button: Toggle All Atelier Navigation */}
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

export default function AtelierLayout(props: AtelierLayoutProps) {
    return (
        <ToastProvider>
            <AtelierLayoutInner {...props} />
        </ToastProvider>
    );
}