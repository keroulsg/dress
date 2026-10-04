import { Link, router } from '@inertiajs/react';
import {
    Bookmark,
    ChevronDown,
    Heart,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    ShieldAlert,
    ShoppingBag,
    Sparkles,
    Store,
    Tag,
    User as UserIcon,
    X,
} from 'lucide-react';
import * as React from 'react';

import type { AuthUser } from '../../Lib/permissions';
import { cn } from '../../Lib/utils';
import { Button } from '../UI/Button';
import { useLanguage } from '@/Contexts/LanguageContext';
import { LanguageSwitcher } from '../UI/LanguageSwitcher';
import { ThemeToggle } from '../UI/ThemeToggle';

export interface StorefrontNavbarProps {
    user?: AuthUser | null;
    cartCount?: number;
    wishlistCount?: number;
}

export function StorefrontNavbar({ user, cartCount = 0, wishlistCount = 0 }: StorefrontNavbarProps) {
    const { t, isRtl } = useLanguage();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const navLinks = [
        { label: t('storefront.nav.collection'), href: '/catalog' },
        { label: isRtl ? 'فساتين زفاف وسهرة' : 'Gowns', href: '/catalog?category=wedding-evening-gowns' },
        { label: isRtl ? 'عبايات وقفاطين' : 'Abayas', href: '/catalog?category=luxury-abayas-kaftans' },
        { label: isRtl ? 'مجوهرات وإكسسوارات' : 'Accessories', href: '/catalog?category=bridal-jewelry-accessories' },
        { label: isRtl ? 'شراء فوري' : 'Buy Now', href: '/catalog?mode=sale' },
        { label: t('storefront.nav.how_it_works'), href: '/#how-it-works' },
    ];

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Strict role derivation
    const isSuperadmin = Boolean(
        user && user.role !== 'renter' && user.role !== 'atelier_owner' && (user.role === 'superadmin' || user.role === 'super_admin' || user.email === 'admin@dress.test')
    );
    const isAtelier = Boolean(
        user && !isSuperadmin && user.role !== 'renter' && (user.role === 'atelier_owner' || user.role === 'atelier_staff') && Boolean(user.atelier_id)
    );
    const isRenter = Boolean(user && !isSuperadmin && !isAtelier);

    const atelierHref = `/atelier/${user?.atelier_id || 1}/dresses`;

    return (
        <header className="sticky top-0 z-40 border-b border-stone-line dark:border-stone-800 bg-ivory/95 dark:bg-stone-950/95 backdrop-blur">
            {/* Top Luxe Announcement Bar */}
            <div className="border-b border-stone-line/40 dark:border-stone-800 bg-charcoal dark:bg-black px-4 py-1.5 text-center text-[11px] uppercase tracking-luxe text-champagne">
                <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-gold" />
                    {t('storefront.announcement')}
                </span>
            </div>

            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
                {/* Brand & Mobile Hamburger */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="rounded-lg p-1 text-charcoal dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 lg:hidden"
                        aria-label="Open menu"
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
                    </button>
                    <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-charcoal dark:text-stone-100 hover:opacity-90">
                        Maison&nbsp;<span className="text-rose dark:text-rose-400">Rentale</span>
                    </Link>
                </div>

                {/* Primary Nav Links */}
                <nav aria-label="Main navigation" className="hidden items-center gap-6 text-xs font-medium text-stone-muted dark:text-stone-400 lg:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="transition-colors hover:text-charcoal dark:hover:text-stone-100"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions & Auth */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Day / Night Theme Toggle */}
                    <ThemeToggle />

                    {/* Language Switcher */}
                    <LanguageSwitcher />

                    {/* Wishlist Link */}
                    <Link
                        href="/account/saved"
                        aria-label={`Wishlist, ${wishlistCount} items`}
                        className="relative p-1.5 text-stone-muted dark:text-stone-400 transition-colors hover:text-charcoal dark:hover:text-stone-100"
                    >
                        <Heart className="h-5 w-5" aria-hidden="true" />
                        {wishlistCount > 0 ? (
                            <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-semibold text-white">
                                {wishlistCount}
                            </span>
                        ) : null}
                    </Link>

                    {/* Dedicated Quick Action Badge for SuperAdmin */}
                    {isSuperadmin && (
                        <Link
                            href="/admin/finance"
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-rose-deep/10 dark:bg-rose-950/40 border border-rose/30 dark:border-rose-800 px-3 py-1 text-xs font-semibold text-rose-deep dark:text-rose-300 hover:bg-rose-deep hover:text-white transition-colors"
                        >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            <span>{t('storefront.admin_console')}</span>
                        </Link>
                    )}

                    {/* Dedicated Quick Action Badge for Atelier Owner */}
                    {isAtelier && (
                        <Link
                            href={atelierHref}
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-champagne/20 dark:bg-amber-950/40 border border-champagne/40 dark:border-amber-800 px-3 py-1 text-xs font-semibold text-charcoal dark:text-amber-300 hover:bg-charcoal hover:text-champagne transition-colors"
                        >
                            <Store className="h-3.5 w-3.5 text-gold" />
                            <span>{t('storefront.atelier_studio')}</span>
                        </Link>
                    )}

                    {/* Authenticated User Menu */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className="flex items-center gap-2 rounded-full border border-stone-line dark:border-stone-800 bg-white dark:bg-stone-900 px-3 py-1.5 text-xs font-semibold text-charcoal dark:text-stone-100 shadow-xs transition-all hover:border-charcoal dark:hover:border-amber-500 focus:outline-none"
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal dark:bg-stone-800 text-champagne text-[11px] font-bold">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="hidden max-w-[110px] truncate sm:inline-block">{user.name}</span>
                                <ChevronDown className="h-3.5 w-3.5 text-stone-muted dark:text-stone-400" />
                            </button>

                            {dropdownOpen && (
                                <div className={cn(
                                    'absolute mt-2 w-64 origin-top rounded-2xl border border-stone-line dark:border-stone-800 bg-white dark:bg-stone-900 py-2 shadow-xl ring-1 ring-black/5 dark:ring-stone-800 z-50 animate-in fade-in zoom-in-95 duration-100',
                                    isRtl ? 'left-0' : 'right-0',
                                )}>
                                    <div className="border-b border-stone-line dark:border-stone-800 px-4 py-2.5">
                                        <p className="text-xs font-semibold text-charcoal dark:text-stone-100 truncate">{user.name}</p>
                                        <p className="text-[11px] text-stone-muted dark:text-stone-400 truncate">{user.email}</p>
                                        <span className="mt-1.5 inline-block rounded bg-stone-line/40 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-medium text-charcoal dark:text-stone-300 uppercase tracking-wider">
                                            {isSuperadmin ? 'مدير المنصة (Super Admin)' : isAtelier ? 'صاحبة أتيليه (Atelier)' : 'مستأجرة (Customer)'}
                                        </span>
                                    </div>

                                    <div className="py-1">
                                        {/* SuperAdmin Links */}
                                        {isSuperadmin && (
                                            <>
                                                <Link
                                                    href="/admin/finance"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-deep dark:text-rose-400 transition-colors hover:bg-rose/5 dark:hover:bg-rose-950/30"
                                                >
                                                    <ShieldAlert className="h-4 w-4" />
                                                    <span>لوحة الإدارة المركزية (Finance)</span>
                                                </Link>
                                                <Link
                                                    href="/admin/categories"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal dark:text-stone-200 transition-colors hover:bg-stone-line/40 dark:hover:bg-stone-800"
                                                >
                                                    <Tag className="h-4 w-4 text-stone-muted dark:text-stone-400" />
                                                    <span>إدارة الأقسام (Categories)</span>
                                                </Link>
                                            </>
                                        )}

                                        {/* Atelier Owner Links */}
                                        {isAtelier && (
                                            <>
                                                <Link
                                                    href={atelierHref}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal dark:text-amber-300 transition-colors hover:bg-stone-line/40 dark:hover:bg-stone-800"
                                                >
                                                    <Store className="h-4 w-4 text-gold" />
                                                    <span>استوديو الأتيليه (Atelier Studio)</span>
                                                </Link>
                                                <Link
                                                    href={`/atelier/${user?.atelier_id || 1}/bookings`}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal dark:text-stone-300 transition-colors hover:bg-stone-line/40 dark:hover:bg-stone-800"
                                                >
                                                    <Package className="h-4 w-4 text-stone-muted dark:text-stone-400" />
                                                    <span>الحجوزات (Bookings)</span>
                                                </Link>
                                                <Link
                                                    href={`/atelier/${user?.atelier_id || 1}/finance`}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal dark:text-stone-300 transition-colors hover:bg-stone-line/40 dark:hover:bg-stone-800"
                                                >
                                                    <LayoutDashboard className="h-4 w-4 text-stone-muted dark:text-stone-400" />
                                                    <span>المالية والأرباح (Finance)</span>
                                                </Link>
                                            </>
                                        )}

                                        {/* Regular Customer / Renter Links */}
                                        {isRenter && (
                                            <>
                                                <Link
                                                    href="/account"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal dark:text-stone-200 transition-colors hover:bg-stone-line/40 dark:hover:bg-stone-800"
                                                >
                                                    <UserIcon className="h-4 w-4 text-stone-muted dark:text-stone-400" />
                                                    <span>حسابي (My Account)</span>
                                                </Link>
                                                <Link
                                                    href="/account/bookings"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal dark:text-stone-300 transition-colors hover:bg-stone-line/40 dark:hover:bg-stone-800"
                                                >
                                                    <Package className="h-4 w-4 text-stone-muted dark:text-stone-400" />
                                                    <span>حجوزاتي (My Bookings)</span>
                                                </Link>
                                                <Link
                                                    href="/account/saved"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal dark:text-stone-300 transition-colors hover:bg-stone-line/40 dark:hover:bg-stone-800"
                                                >
                                                    <Heart className="h-4 w-4 text-rose dark:text-rose-400" />
                                                    <span>المفضلة (Saved Dresses)</span>
                                                </Link>
                                            </>
                                        )}

                                        <Link
                                            href="/account/profile"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal dark:text-stone-300 transition-colors hover:bg-stone-line/40 dark:hover:bg-stone-800 border-t border-stone-line/60 dark:border-stone-800"
                                        >
                                            <UserIcon className="h-4 w-4 text-stone-muted dark:text-stone-400" />
                                            <span>إعدادات الحساب (Settings)</span>
                                        </Link>
                                    </div>

                                    <div className="border-t border-stone-line dark:border-stone-800 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                router.post('/logout');
                                            }}
                                            className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-danger hover:bg-danger/10 transition-colors text-left"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>تسجيل الخروج (Sign out)</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* GUEST MODE: STRICT PROMINENT BUTTONS */
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-charcoal dark:text-stone-100 shadow-xs hover:border-charcoal hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                            >
                                {t('storefront.login_btn')}
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center rounded-xl bg-charcoal dark:bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-champagne dark:text-white shadow-xs hover:bg-black dark:hover:bg-amber-500 transition-all"
                            >
                                {t('storefront.register_btn')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileOpen ? (
                <nav aria-label="Mobile navigation" className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-5 py-5 lg:hidden shadow-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-3.5">
                        <div className="grid grid-cols-1 gap-2 pb-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="px-3 py-2.5 rounded-xl text-sm font-semibold text-charcoal dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors flex items-center justify-between"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <span>{link.label}</span>
                                    <span className="text-stone-400 text-xs">➔</span>
                                </Link>
                            ))}
                        </div>

                        {/* WhatsApp Quick Action in Mobile Menu */}
                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                            <a
                                href="https://wa.me/201220821706"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                            >
                                <span>واتساب الدعم الفني: 01220821706</span>
                            </a>
                        </div>

                        <div className="border-t border-stone-line dark:border-stone-800 pt-3">
                            {!user ? (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href="/login"
                                        className="rounded-xl border border-stone-200 dark:border-stone-700 py-2.5 text-center text-xs font-bold text-charcoal dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {t('storefront.login_btn')}
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-xl bg-charcoal dark:bg-amber-600 py-2.5 text-center text-xs font-bold text-champagne dark:text-white hover:bg-black dark:hover:bg-amber-500"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {t('storefront.register_btn')}
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {isSuperadmin && (
                                        <>
                                            <Link
                                                href="/admin/finance"
                                                className="text-sm font-semibold text-rose-deep"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                لوحة الإدارة المركزية (Admin Dashboard)
                                            </Link>
                                            <Link
                                                href="/admin/categories"
                                                className="text-sm font-medium text-charcoal"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                إدارة الأقسام (Categories)
                                            </Link>
                                        </>
                                    )}

                                    {isAtelier && (
                                        <Link
                                            href={atelierHref}
                                            className="text-sm font-semibold text-charcoal"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            استوديو الأتيليه (Atelier Studio)
                                        </Link>
                                    )}

                                    {isRenter && (
                                        <>
                                            <Link
                                                href="/account"
                                                className="text-sm font-semibold text-charcoal"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                حسابي (My Account)
                                            </Link>
                                            <Link
                                                href="/account/bookings"
                                                className="text-sm font-medium text-charcoal"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                حجوزاتي (My Bookings)
                                            </Link>
                                            <Link
                                                href="/account/saved"
                                                className="text-sm font-medium text-charcoal"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                المفضلة (Saved Dresses)
                                            </Link>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMobileOpen(false);
                                            router.post('/logout');
                                        }}
                                        className="text-right text-sm font-medium text-danger pt-2 border-t border-stone-line"
                                    >
                                        تسجيل الخروج / Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            ) : null}
        </header>
    );
}

export { cn };