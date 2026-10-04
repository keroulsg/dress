import React, { useState, PropsWithChildren } from 'react';
import { ToastProvider } from '../Components/Feedback/Toast';
import { LanguageProvider, useLanguage } from '../Contexts/LanguageContext';
import { AdminSidebar } from '../Components/Navigation/AdminSidebar';
import { LanguageSwitcher } from '../Components/UI/LanguageSwitcher';
import { ThemeToggle } from '../Components/UI/ThemeToggle';
import { Menu, Sparkles, ExternalLink } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { CHeader, CContainer, CBadge } from '@coreui/react';
import { cn } from '../Lib/utils';

function AdminLayoutInner({ children }: PropsWithChildren) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { t, isRtl, locale } = useLanguage();
    const { url } = usePage();

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
                <CHeader className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(true)}
                            className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 lg:hidden"
                            aria-label="Open sidebar menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                                {isRtl ? 'لوحة الإدارة المركزية والرقابة' : 'Central Admin & Governance'}
                            </span>
                            <span className="hidden sm:inline-block text-xs text-stone-400 dark:text-stone-500 font-mono">· Maison</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
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
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-6 py-4 text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
                        <p>© {new Date().getFullYear()} Maison Rentale. {isRtl ? 'كافة العمليات خاضعة لسجلات التدقيق المالي والأمني.' : 'All operations are subject to financial and security audit logs.'}</p>
                        <p className="font-mono text-[11px] text-stone-400 dark:text-stone-500">CoreUI Monolith Architecture · v2.4.0</p>
                    </div>
                </footer>
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