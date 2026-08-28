import { Link } from '@inertiajs/react';
import { LayoutDashboard, Menu, Settings, ShieldCheck, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';

export interface AdminNavbarProps {
    items?: { label: string; href: string; active?: boolean }[];
}

const defaultItems = [
    { label: 'Overview', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Ateliers', href: '/admin/ateliers' },
    { label: 'Catalog', href: '/admin/catalog' },
    { label: 'Bookings', href: '/admin/bookings' },
    { label: 'Payments', href: '/admin/payments' },
    { label: 'Ledger', href: '/admin/finance' },
    { label: 'Disputes', href: '/admin/disputes' },
    { label: 'KYC', href: '/admin/kyc' },
    { label: 'Reviews', href: '/admin/reviews' },
    { label: 'Audit log', href: '/admin/audit' },
    { label: 'Settings', href: '/admin/settings' },
];

export function AdminNavbar({ items = defaultItems }: AdminNavbarProps) {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-stone-line bg-charcoal text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="rounded-none p-1 text-white lg:hidden"
                        aria-label="Toggle admin menu"
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
                    </button>
                    <Link href="/admin" className="flex items-center gap-2 font-display text-lg text-white">
                        <ShieldCheck className="h-5 w-5 text-champagne" aria-hidden="true" />
                        Admin Console
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-1.5 text-xs text-stone-muted transition-colors hover:text-white">
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                        View storefront
                    </Link>
                    <Link href="/admin/settings" aria-label="Platform settings" className="text-stone-muted transition-colors hover:text-white">
                        <Settings className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>

            <nav aria-label="Admin navigation" className={cn('mx-auto max-w-7xl px-4 lg:px-8', mobileOpen ? 'pb-3' : 'hidden lg:block')}>
                <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-1 lg:overflow-x-auto">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'whitespace-nowrap rounded-none px-3 py-2 text-sm transition-colors',
                                item.active
                                    ? 'bg-champagne text-charcoal'
                                    : 'text-stone-muted hover:bg-white/5 hover:text-white',
                            )}
                            aria-current={item.active ? 'page' : undefined}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
}