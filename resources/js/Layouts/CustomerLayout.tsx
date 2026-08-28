import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CreditCard,
    FileText,
    Heart,
    Home,
    MessageSquare,
    Scale,
    ShieldCheck,
    User as UserIcon,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';

import { ToastProvider } from '../Components/Feedback/Toast';
import { cn } from '../Lib/utils';
import { Badge } from '../Components/UI/Badge';
import type { AuthUser } from '../Lib/permissions';

const navItems = [
    { label: 'Overview', href: '/account', icon: Home },
    { label: 'My bookings', href: '/account/bookings', icon: CalendarDays },
    { label: 'Saved dresses', href: '/account/saved', icon: Heart },
    { label: 'Payments', href: '/account/payments', icon: CreditCard },
    { label: 'Disputes', href: '/account/disputes', icon: Scale },
    { label: 'Reviews', href: '/account/reviews', icon: MessageSquare },
    { label: 'Verification', href: '/account/kyc', icon: ShieldCheck },
    { label: 'Profile', href: '/account/profile', icon: UserIcon },
];

export default function CustomerLayout({ children }: PropsWithChildren) {
    const { props, url } = usePage();
    const auth = props.auth as { user: AuthUser | null };
    const pageUrl = url;

    return (
        <ToastProvider>
            <div className="min-h-screen bg-ivory text-charcoal">
                <header className="border-b border-stone-line bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
                        <Link href="/" className="font-display text-xl text-charcoal">
                            Maison <span className="text-rose">Rentale</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            {auth.user?.permissions?.includes('kyc.verified') ? (
                                <Badge tone="success">
                                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                                    Verified
                                </Badge>
                            ) : (
                                <Link href="/account/kyc" className="text-xs text-stone-muted hover:text-charcoal">
                                    Complete verification
                                </Link>
                            )}
                            <Link href="/" className="text-sm text-stone-muted transition-colors hover:text-charcoal">
                                Back to store
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row lg:px-8">
                    <nav aria-label="Account navigation" className="lg:w-56 lg:shrink-0">
                        <p className="mb-2 hidden text-xs font-semibold uppercase tracking-luxe text-stone-muted lg:block">
                            My account
                        </p>
                        <div className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible">
                            {navItems.map((item) => {
                                const active = pageUrl.startsWith(item.href);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex shrink-0 items-center gap-3 rounded-none px-3 py-2.5 text-sm transition-colors',
                                            active
                                                ? 'bg-champagne/15 font-medium text-rose-deep'
                                                : 'text-stone-muted hover:bg-white hover:text-charcoal',
                                        )}
                                        aria-current={active ? 'page' : undefined}
                                    >
                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="mt-4 hidden border-t border-stone-line pt-4 text-xs text-stone-muted lg:block">
                            <p className="mb-1 font-medium text-charcoal">{auth.user?.name}</p>
                            <p className="truncate">{auth.user?.email}</p>
                            <Link href="/logout" method="post" className="mt-3 inline-block text-stone-muted transition-colors hover:text-danger">
                                Sign out
                            </Link>
                        </div>
                    </nav>

                    <main className="min-w-0 flex-1">{children}</main>
                </div>
            </div>
        </ToastProvider>
    );
}