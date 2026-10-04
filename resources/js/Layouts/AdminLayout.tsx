import React, { useState, PropsWithChildren } from 'react';
import { ToastProvider } from '../Components/Feedback/Toast';
import { LanguageProvider, useLanguage } from '../Contexts/LanguageContext';
import { AdminSidebar } from '../Components/Navigation/AdminSidebar';
import { LanguageSwitcher } from '../Components/UI/LanguageSwitcher';
import { ThemeToggle } from '../Components/UI/ThemeToggle';
import {
    DollarSign,
    Layers,
    Menu,
    Package,
    ShieldCheck,
    Sparkles,
    Store,
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { CHeader } from '@coreui/react';
import { cn } from '../Lib/utils';

function AdminLayoutInner({ children }: PropsWithChildren) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { t, tr, isRtl } = useLanguage();
    const { url } = usePage();

    const bottomTabs = [
        { href: '/admin/finance', label: tr('المالية', 'Finance'), icon: DollarSign },
        { href: '/admin/catalog', label: tr('الكتالوج', 'Catalog'), icon: Layers },
        { href: '/admin/bookings', label: tr('الحجوزات', 'Bookings'), icon: Package },
        { href: '/admin/ateliers', label: tr('الأتيليهات', 'Ateliers'), icon: Store },
    ];

    return (
        <div className="min-h-screen bg-[#f9f8f6] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 flex font-sans antialiased">
            {/* CoreUI Sidebar */}
            <AdminSidebar
                mobileOpen={mobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
            />

            {/* Main Content Area (Offset adaptively based on RTL / LTR) */}
            <div
                className={cn(
                    'flex-1 flex flex-col min-w-0 transition-all duration-200',
                    isRtl ? 'lg:mr-64 lg:ml-0' : 'lg:ml-64 lg:mr-0',
                )}
            >
                {/* CoreUI Header */}
                <CHeader className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 px-3 sm:px-6 lg:px-8 backdrop-blur-md shadow-xs">
                    <div className="flex items-center gap-2.5 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(true)}
                            className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 lg:hidden transition-colors"
                            aria-label="Open sidebar menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="font-serif text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                                {isRtl ? 'لوحة الإدارة المركزية والرقابة' : 'Central Admin & Governance'}
                            </span>
                            <span className="hidden sm:inline-block text-xs text-stone-400 dark:text-stone-500 font-mono">· Maison</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-3">
                        {/* Day / Night Mode Toggle */}
                        <ThemeToggle />

                        {/* Language Switcher Button */}
                        <LanguageSwitcher />

                        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 px-2.5 py-1 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                            <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            <span>{t('common.superadmin')}</span>
                        </span>
                    </div>
                </CHeader>

                {/* Page Content Container */}
                <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 sm:pb-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="hidden sm:block border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-6 py-4 text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
                        <p>© {new Date().getFullYear()} Maison Rentale. {isRtl ? 'كافة العمليات خاضعة لسجلات التدقيق المالي والأمني.' : 'All operations are subject to financial and security audit logs.'}</p>
                        <p className="font-mono text-[11px] text-stone-400 dark:text-stone-500">CoreUI Monolith Architecture · v2.4.0</p>
                    </div>
                </footer>
            </div>

            {/* Mobile Bottom Quick Dock Navigation (Smart Phone Bar) */}
            <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-stone-950/95 border-t border-stone-200 dark:border-stone-800 backdrop-blur-md shadow-lg px-2 py-1.5 safe-area-bottom">
                <div className="grid grid-cols-5 items-center justify-around">
                    {bottomTabs.map((tab) => {
                        const active = url.startsWith(tab.href);
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

                    {/* 5th button: Toggle All Admin Menu */}
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
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

export default function AdminLayout({ children }: PropsWithChildren) {
    return (
        <ToastProvider>
            <AdminLayoutInner>{children}</AdminLayoutInner>
        </ToastProvider>
    );
}