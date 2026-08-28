import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardCheck,
    Gauge,
    Images,
    LayoutDashboard,
    LogOut,
    Ruler,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';
import { Badge } from '../UI/Badge';

export interface AtelierSidebarItem {
    label: string;
    href: string;
    icon?: 'dashboard' | 'bookings' | 'calendar' | 'inventory' | 'inspection' | 'media' | 'finance' | 'settings';
    active?: boolean;
}

export interface AtelierSidebarProps {
    businessName: string;
    storeActive: boolean;
    roleBadge: string;
    items?: AtelierSidebarItem[];
    user?: { name: string } | null;
}

const icons = {
    dashboard: LayoutDashboard,
    bookings: CalendarDays,
    calendar: CalendarDays,
    inventory: Images,
    inspection: ClipboardCheck,
    media: Images,
    finance: Wallet,
    settings: Ruler,
};

const defaultItems: AtelierSidebarItem[] = [
    { label: 'Overview', href: '/atelier', icon: 'dashboard' },
    { label: 'Booking pipeline', href: '/atelier/bookings', icon: 'bookings' },
    { label: 'Calendar', href: '/atelier/calendar', icon: 'calendar' },
    { label: 'Inventory', href: '/atelier/inventory', icon: 'inventory' },
    { label: 'Inspections', href: '/atelier/inspections', icon: 'inspection' },
    { label: 'Revenue & payouts', href: '/atelier/finance', icon: 'finance' },
    { label: 'Studio settings', href: '/atelier/settings', icon: 'settings' },
];

export function AtelierSidebar({
    businessName,
    storeActive,
    roleBadge,
    items = defaultItems,
    user,
}: AtelierSidebarProps) {
    return (
        <aside className="flex h-full w-full flex-col border-r border-stone-line bg-white">
            <div className="border-b border-stone-line p-5">
                <p className="font-display text-xl text-charcoal">{businessName}</p>
                <div className="mt-2 flex items-center gap-2">
                    <Badge tone={storeActive ? 'success' : 'danger'}>
                        <span
                            className={cn('h-1.5 w-1.5 rounded-full', storeActive ? 'bg-success' : 'bg-danger')}
                            aria-hidden="true"
                        />
                        {storeActive ? 'Store active' : 'Store offline'}
                    </Badge>
                    <Badge tone="champagne">{roleBadge}</Badge>
                </div>
            </div>

            <nav aria-label="Atelier navigation" className="flex-1 space-y-1 overflow-y-auto p-3">
                {items.map((item) => {
                    const Icon = icons[item.icon ?? 'dashboard'];

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-none px-3 py-2.5 text-sm transition-colors',
                                item.active
                                    ? 'bg-champagne/15 font-medium text-rose-deep'
                                    : 'text-stone-muted hover:bg-ivory hover:text-charcoal',
                            )}
                            aria-current={item.active ? 'page' : undefined}
                        >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-stone-line p-4">
                {user ? <p className="mb-3 truncate text-xs text-stone-muted">{user.name}</p> : null}
                <Link
                    href="/logout"
                    method="post"
                    className="flex items-center gap-2 text-xs font-medium text-stone-muted transition-colors hover:text-danger"
                >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                </Link>
            </div>
        </aside>
    );
}