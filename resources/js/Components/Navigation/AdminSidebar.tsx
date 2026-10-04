import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    CSidebar,
    CSidebarHeader,
    CSidebarBrand,
    CSidebarNav,
    CSidebarFooter,
    CNavTitle,
    CNavItem,
    CBadge,
} from '@coreui/react';
import {
    Clock,
    CreditCard,
    DollarSign,
    ExternalLink,
    Layers,
    LogOut,
    MessageSquare,
    Package,
    Scale,
    Settings,
    ShieldCheck,
    Store,
    Tag,
    UserCheck,
    Users,
    X,
    Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn } from '../../Lib/utils';

export interface AdminSidebarProps {
    mobileOpen?: boolean;
    onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
    const { url, props } = usePage();
    const user = (props.auth as any)?.user;
    const { t, isRtl, locale } = useLanguage();

    const navSections = [
        {
            titleKey: 'nav.group.financials',
            items: [
                { key: 'nav.admin.finance', href: '/admin/finance', icon: DollarSign },
                { key: 'nav.admin.payments', href: '/admin/payments', icon: CreditCard },
            ],
        },
        {
            titleKey: 'nav.group.catalog',
            items: [
                { key: 'nav.admin.catalog', href: '/admin/catalog', icon: Layers, badge: '20' },
                { key: 'nav.admin.categories', href: '/admin/categories', icon: Tag },
                { key: 'nav.admin.bookings', href: '/admin/bookings', icon: Package },
            ],
        },
        {
            titleKey: 'nav.group.partners',
            items: [
                { key: 'nav.admin.ateliers', href: '/admin/ateliers', icon: Store },
                { key: 'nav.admin.users', href: '/admin/users', icon: Users },
                { key: 'nav.admin.kyc', href: '/admin/kyc', icon: UserCheck },
            ],
        },
        {
            titleKey: 'nav.group.governance',
            items: [
                { key: 'nav.admin.disputes', href: '/admin/disputes', icon: Scale },
                { key: 'nav.admin.reviews', href: '/admin/reviews', icon: MessageSquare },
                { key: 'nav.admin.audit', href: '/admin/audit', icon: Clock },
                { key: 'nav.admin.settings', href: '/admin/settings', icon: Settings },
            ],
        },
    ];

    const sidebarCore = (
        <CSidebar
            className={cn(
                'coreui-sidebar flex h-full flex-col bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 shadow-sm transition-all',
                isRtl ? 'border-l' : 'border-r',
            )}
        >
            {/* CoreUI Sidebar Header & Brand */}
            <CSidebarHeader className="p-4 border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950">
                <div className="flex items-center justify-between">
                    <CSidebarBrand className="flex items-center gap-2.5 no-underline">
                        <Link href="/admin/finance" className="flex items-center gap-2.5 text-stone-900 dark:text-stone-100 hover:text-stone-700 dark:hover:text-stone-300">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 dark:bg-stone-800 text-amber-400 shadow-sm border border-transparent dark:border-amber-500/20">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 tracking-wide block leading-tight">
                                    Maison <span className="text-amber-700 dark:text-amber-400">Console</span>
                                </span>
                                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono tracking-wider uppercase block">
                                    CoreUI Admin
                                </span>
                            </div>
                        </Link>
                    </CSidebarBrand>

                    {onCloseMobile && (
                        <button
                            type="button"
                            onClick={onCloseMobile}
                            className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-700 dark:hover:text-stone-200 lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* System Health Status */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 px-3 py-1.5 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t('common.system_online')}</span>
                    </span>
                    <CBadge color="success" shape="rounded-pill" className="text-[9px] bg-emerald-600 text-white font-mono px-1.5 py-0.5">
                        99.9%
                    </CBadge>
                </div>
            </CSidebarHeader>

            {/* CoreUI Sidebar Navigation */}
            <CSidebarNav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                {navSections.map((section, idx) => (
                    <div key={idx} className="space-y-1">
                        <CNavTitle className="px-3 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1 font-mono">
                            {t(section.titleKey)}
                        </CNavTitle>

                        {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = url.startsWith(item.href);

                            return (
                                <CNavItem key={item.href} className="list-none">
                                    <Link
                                        href={item.href}
                                        onClick={onCloseMobile}
                                        className={cn(
                                            'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all group',
                                            isActive
                                                ? 'bg-stone-900 dark:bg-amber-950/60 text-amber-300 dark:text-amber-300 shadow-sm border border-stone-800 dark:border-amber-500/30'
                                                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100',
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                                                isActive ? 'text-amber-400' : 'text-stone-400 dark:text-stone-500',
                                            )}
                                        />
                                        <span className="flex-1 truncate">{t(item.key)}</span>
                                        {item.badge && (
                                            <CBadge
                                                color={isActive ? 'warning' : 'secondary'}
                                                className={cn(
                                                    'text-[10px] font-mono rounded-full px-2 py-0.5',
                                                    isActive
                                                        ? 'bg-amber-400 text-stone-950'
                                                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400',
                                                )}
                                            >
                                                {item.badge}
                                            </CBadge>
                                        )}
                                    </Link>
                                </CNavItem>
                            );
                        })}
                    </div>
                ))}
            </CSidebarNav>

            {/* CoreUI Sidebar Footer */}
            <CSidebarFooter className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/50 space-y-3">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-all shadow-xs"
                >
                    <span className="flex items-center gap-2">
                        <ExternalLink className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{t('common.storefront')}</span>
                    </span>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">↗</span>
                </Link>

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 dark:bg-stone-800 text-amber-400 text-xs font-bold shadow-xs">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="truncate max-w-[120px]">
                            <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{user?.name || t('common.superadmin')}</p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate font-mono">{user?.email || 'admin@dress.test'}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 transition-colors"
                        title={t('common.logout')}
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </CSidebarFooter>
        </CSidebar>
    );

    return (
        <>
            {/* Desktop Fixed Sidebar (adaptive right in RTL, left in LTR) */}
            <aside
                className={cn(
                    'hidden lg:block fixed inset-y-0 z-30 w-64 shadow-sm',
                    isRtl ? 'right-0' : 'left-0',
                )}
            >
                {sidebarCore}
            </aside>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs transition-opacity"
                        onClick={onCloseMobile}
                    />
                    <div
                        className={cn(
                            'fixed inset-y-0 w-72 max-w-full shadow-2xl animate-in duration-200',
                            isRtl ? 'right-0 slide-in-from-right' : 'left-0 slide-in-from-left',
                        )}
                    >
                        {sidebarCore}
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminSidebar;
