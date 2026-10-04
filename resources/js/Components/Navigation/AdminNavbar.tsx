import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Clock,
    CreditCard,
    DollarSign,
    ExternalLink,
    FileCheck2,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquare,
    Package,
    Scale,
    Settings,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Store,
    Tag,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';

export interface AdminNavbarProps {
    items?: { label: string; href: string; icon?: React.ComponentType<{ className?: string }> }[];
}

const navItems = [
    { label: 'المالية والحسابات (Finance)', href: '/admin/finance', icon: DollarSign },
    { label: 'الأقسام (Categories)', href: '/admin/categories', icon: Tag },
    { label: 'المستخدمين (Users)', href: '/admin/users', icon: Users },
    { label: 'الأتيليهات (Ateliers)', href: '/admin/ateliers', icon: Store },
    { label: 'الكتالوج (Catalog)', href: '/admin/catalog', icon: Layers },
    { label: 'الحجوزات (Bookings)', href: '/admin/bookings', icon: Package },
    { label: 'المدفوعات (Payments)', href: '/admin/payments', icon: CreditCard },
    { label: 'النزاعات (Disputes)', href: '/admin/disputes', icon: Scale },
    { label: 'التحقق (KYC)', href: '/admin/kyc', icon: UserCheck },
    { label: 'التقييمات (Reviews)', href: '/admin/reviews', icon: MessageSquare },
    { label: 'سجل العمليات (Audit)', href: '/admin/audit', icon: Clock },
    { label: 'الإعدادات (Settings)', href: '/admin/settings', icon: Settings },
];

export function AdminNavbar() {
    const { url } = usePage();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-stone-800 bg-[#121316]/95 backdrop-blur-md shadow-2xl">
            {/* Top Bar: Brand, Platform Status & Quick Links */}
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 border-b border-stone-800/80">
                <div className="flex items-center gap-3.5">
                    <button
                        type="button"
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white lg:hidden transition-colors"
                        aria-label="Toggle admin menu"
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>

                    <Link href="/admin/finance" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-md group-hover:scale-105 transition-transform">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="font-serif text-lg font-bold text-white tracking-wide block leading-tight">
                                Maison <span className="text-amber-400">Console</span>
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono tracking-widest uppercase block">
                                Central Admin & Oversight
                            </span>
                        </div>
                    </Link>

                    {/* Live System Indicator */}
                    <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-3 py-1 text-[11px] text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>نظام المنصة يعمل بكفاءة 100%</span>
                    </div>
                </div>

                {/* Top Right Controls */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-900/80 px-3 py-1.5 text-xs font-medium text-stone-300 hover:border-amber-400/60 hover:text-white transition-all shadow-sm"
                    >
                        <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
                        <span>زيارة المتجر العام</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 transition-all"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">تسجيل الخروج</span>
                    </button>
                </div>
            </div>

            {/* Horizontal Navigation Links Bar */}
            <nav aria-label="Admin primary navigation" className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', mobileOpen ? 'py-3' : 'hidden lg:block')}>
                <div className="flex flex-col gap-1 py-1.5 lg:flex-row lg:items-center lg:gap-1.5 lg:overflow-x-auto no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all',
                                    isActive
                                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/40 shadow-sm font-semibold'
                                        : 'text-stone-400 hover:bg-stone-800/60 hover:text-stone-100 border border-transparent',
                                )}
                            >
                                {Icon && <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-amber-400' : 'text-stone-400')} />}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </header>
    );
}