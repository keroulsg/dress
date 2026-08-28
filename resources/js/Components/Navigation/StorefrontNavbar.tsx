import { Link } from '@inertiajs/react';
import { Heart, Menu, ShoppingBag, User as UserIcon, X } from 'lucide-react';
import * as React from 'react';

import type { AuthUser } from '../../Lib/permissions';
import { cn } from '../../Lib/utils';
import { Button } from '../UI/Button';

export interface StorefrontNavbarProps {
    user?: AuthUser | null;
    cartCount?: number;
    wishlistCount?: number;
}

const navLinks = [
    { label: 'Collections', href: '/catalog' },
    { label: 'Occasions', href: '/occasions' },
    { label: 'Ateliers', href: '/ateliers' },
    { label: 'How it works', href: '/#how-it-works' },
];

export function StorefrontNavbar({ user, cartCount = 0, wishlistCount = 0 }: StorefrontNavbarProps) {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-stone-line bg-ivory/90 backdrop-blur">
            <div className="border-b border-stone-line bg-charcoal px-4 py-1.5 text-center text-[11px] uppercase tracking-luxe text-champagne">
                Premium dress rental, delivered to your door
            </div>

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        className="rounded-none p-1 text-charcoal lg:hidden"
                        aria-label="Open menu"
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
                    </button>
                    <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-charcoal">
                        Maison&nbsp;<span className="text-rose">Rentale</span>
                    </Link>
                </div>

                <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm text-stone-muted lg:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="transition-colors hover:text-charcoal"
                            aria-label={link.label}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/wishlist" aria-label={`Wishlist, ${wishlistCount} items`} className="relative hidden text-stone-muted transition-colors hover:text-charcoal sm:block">
                        <Heart className="h-5 w-5" aria-hidden="true" />
                        {wishlistCount > 0 ? (
                            <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white">
                                {wishlistCount}
                            </span>
                        ) : null}
                    </Link>
                    <Link href="/checkout" aria-label={`Cart, ${cartCount} items`} className="relative text-stone-muted transition-colors hover:text-charcoal">
                        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                        {cartCount > 0 ? (
                            <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white">
                                {cartCount}
                            </span>
                        ) : null}
                    </Link>
                    {user ? (
                        <Link href="/dashboard" aria-label="My account" className="text-stone-muted transition-colors hover:text-charcoal">
                            <UserIcon className="h-5 w-5" aria-hidden="true" />
                        </Link>
                    ) : (
                        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                            <Link href="/login">Sign in</Link>
                        </Button>
                    )}
                </div>
            </div>

            {mobileOpen ? (
                <nav aria-label="Mobile navigation" className="border-t border-stone-line bg-white px-4 py-4 lg:hidden">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-charcoal"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {!user ? (
                            <Link href="/login" className="text-sm font-semibold text-rose" onClick={() => setMobileOpen(false)}>
                                Sign in
                            </Link>
                        ) : null}
                    </div>
                </nav>
            ) : null}
        </header>
    );
}

export { cn };