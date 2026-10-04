import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardCheck,
    Images,
    LayoutDashboard,
    LogOut,
    Plus,
    Ruler,
    Settings,
    ShoppingBag,
    Wallet,
    X,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';
import { Badge } from '../UI/Badge';
import { useLanguage } from '@/Contexts/LanguageContext';

export interface AtelierSidebarItem {
    label: string;
    href: string;
    icon?: 'dashboard' | 'dresses' | 'bookings' | 'calendar' | 'inventory' | 'inspection' | 'finance' | 'settings';
    active?: boolean;
}

export interface AtelierSidebarProps {
    atelierId?: number;
    businessName: string;
    storeActive: boolean;
    roleBadge: string;
    items?: AtelierSidebarItem[];
    user?: { name: string } | null;
    mobileOpen?: boolean;
    onCloseMobile?: () => void;
}

const icons = {
    dashboard: LayoutDashboard,
    dresses: Images,
    bookings: CalendarDays,
    calendar: CalendarDays,
    inventory: Images,
    inspection: ClipboardCheck,
    finance: Wallet,
    settings: Settings,
};

export function AtelierSidebar({
    atelierId = 1,
    businessName,
    storeActive,
    roleBadge,
    items,
    user,
    mobileOpen = false,
    onCloseMobile,
}: AtelierSidebarProps) {
    const { url } = usePage();
    const { t, isRtl } = useLanguage();

    const defaultItems: AtelierSidebarItem[] = [
        { label: isRtl ? 'نظرة عامة' : 'Overview', href: `/atelier/${atelierId}`, icon: 'dashboard' },
        { label: isRtl ? 'الفساتين والمعروضات' : 'Dresses & Catalog', href: `/atelier/${atelierId}/dresses`, icon: 'dresses' },
        { label: isRtl ? 'الحجوزات والطلبات' : 'Bookings & Orders', href: `/atelier/${atelierId}/bookings`, icon: 'bookings' },
        { label: isRtl ? 'تقويم التوافر والمواعيد' : 'Availability Calendar', href: `/atelier/${atelierId}/calendar`, icon: 'calendar' },
        { label: isRtl ? 'المخزون والقطع' : 'Inventory & Sizes', href: `/atelier/${atelierId}/inventory`, icon: 'inventory' },
        { label: isRtl ? 'فحص الاستلام والإرجاع' : 'Inspection Queue', href: `/atelier/${atelierId}/inspections`, icon: 'inspection' },
        { label: isRtl ? 'الأرباح والتحويلات' : 'Earnings & Payouts', href: `/atelier/${atelierId}/finance`, icon: 'finance' },
        { label: isRtl ? 'إعدادات الأتيليه' : 'Atelier Settings', href: `/atelier/${atelierId}/settings`, icon: 'settings' },
    ];

    const navItems = items || defaultItems;

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-xs transition-opacity lg:hidden"
                    onClick={onCloseMobile}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Fixed Container */}
            <aside
                className={cn(
                    'fixed inset-y-0 z-50 flex w-64 flex-col bg-white dark:bg-stone-950 transition-transform duration-200 ease-in-out shadow-lg lg:shadow-none',
                    isRtl
                        ? 'right-0 border-l border-stone-200 dark:border-stone-800'
                        : 'left-0 border-r border-stone-200 dark:border-stone-800',
                    // Mobile slide behavior
                    mobileOpen
                        ? 'translate-x-0'
                        : isRtl
                          ? 'translate-x-full lg:translate-x-0'
                          : '-translate-x-full lg:translate-x-0',
                )}
            >
                {/* Header / Brand */}
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 p-5">
                    <div className="min-w-0 flex-1">
                        <p className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                            {businessName}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge tone={storeActive ? 'success' : 'danger'}>
                                <span
                                    className={cn('h-1.5 w-1.5 rounded-full', storeActive ? 'bg-success' : 'bg-danger')}
                                    aria-hidden="true"
                                />
                                {isRtl
                                    ? storeActive
                                        ? 'المتجر نشط'
                                        : 'المتجر معطل'
                                    : storeActive
                                      ? 'Store Active'
                                      : 'Store Inactive'}
                            </Badge>
                            <Badge tone="champagne">{roleBadge}</Badge>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 lg:hidden"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav aria-label="Atelier navigation" className="flex-1 space-y-1 overflow-y-auto p-3">
                    {navItems.map((item) => {
                        const Icon = icons[item.icon ?? 'dashboard'] || LayoutDashboard;
                        const isActive =
                            url === item.href || (item.href !== `/atelier/${atelierId}` && url.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onCloseMobile}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all',
                                    isActive
                                        ? 'bg-stone-900 dark:bg-amber-950/60 text-amber-300 dark:text-amber-400 border border-transparent dark:border-amber-500/30 shadow-xs'
                                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100',
                                )}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <Icon
                                    className={cn(
                                        'h-4 w-4 shrink-0',
                                        isActive ? 'text-amber-400' : 'text-stone-400 dark:text-stone-500',
                                    )}
                                    aria-hidden="true"
                                />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer User / Logout */}
                <div className="border-t border-stone-100 dark:border-stone-800/80 p-4">
                    {user?.name && (
                        <p className="mb-2 truncate text-xs text-stone-500 dark:text-stone-400 font-mono">
                            {user.name}
                        </p>
                    )}
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400 transition-colors hover:text-rose-600 dark:hover:text-rose-400"
                    >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        <span>{t('common.logout')}</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}

export { cn };
export default AtelierSidebar;