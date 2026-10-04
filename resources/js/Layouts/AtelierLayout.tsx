import { Link, usePage } from '@inertiajs/react';
import React, { useState, PropsWithChildren } from 'react';
import { Menu } from 'lucide-react';

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
    const { atelier } = usePage().props as unknown as { atelier?: AtelierScope | null };
    const { t, isRtl } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const scope = atelier ?? null;

    return (
        <div className="min-h-screen bg-[#f9f8f6] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 flex font-sans antialiased">
            {/* Sidebar (Desktop fixed & Mobile drawer handled inside component) */}
            <AtelierSidebar
                atelierId={(scope as any)?.id ?? 1}
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
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 px-4 sm:px-6 lg:px-8 backdrop-blur shadow-xs">
                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger Button */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="rounded-xl p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-900 lg:hidden"
                            aria-label="Open sidebar menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <Breadcrumbs items={breadcrumbs} homeHref="/atelier" />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Day / Night Theme Toggle */}
                        <ThemeToggle />

                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* Storefront Link */}
                        <Link
                            href="/"
                            className="hidden text-xs font-semibold text-stone-600 dark:text-stone-400 transition-colors hover:text-amber-700 dark:hover:text-amber-400 sm:block"
                        >
                            {t('common.storefront')} ↗
                        </Link>
                    </div>
                </header>

                {/* Page Title if specified */}
                {title && (
                    <div className="border-b border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-950/50 px-4 py-4 sm:px-6 lg:px-8">
                        <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">{title}</h1>
                    </div>
                )}

                {/* Main Content Container */}
                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">{children}</main>

                {/* Footer */}
                <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-6 py-4 text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
                        <p>© {new Date().getFullYear()} Maison Rentale. {isRtl ? 'لوحة تحكم الأتيليه والشركاء' : 'Atelier & Designer Studio'}</p>
                        <p className="font-mono text-[11px] text-stone-400 dark:text-stone-500">Maison Haute Couture Platform</p>
                    </div>
                </footer>
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