import type { PropsWithChildren } from 'react';

import { StorefrontNavbar } from '../Components/Navigation/StorefrontNavbar';
import { usePage } from '@inertiajs/react';
import { ToastProvider } from '../Components/Feedback/Toast';
import { Link } from '@inertiajs/react';
import type { AuthUser } from '../Lib/permissions';

export default function StorefrontLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props;
    const user = (auth.user as AuthUser | null | undefined) ?? null;

    return (
        <ToastProvider>
            <div className="flex min-h-screen flex-col bg-ivory text-charcoal">
                <StorefrontNavbar user={user} />

                <main className="flex-1">{children}</main>

                <footer className="border-t border-stone-line bg-white">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-4 lg:px-8">
                        <div className="lg:col-span-2">
                            <p className="font-display text-2xl text-charcoal">
                                Maison <span className="text-rose">Rentale</span>
                            </p>
                            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-muted">
                                Borrow designer pieces for life's unforgettable moments. Every rental is
                                cleaned, pressed, and delivered to your door.
                            </p>
                        </div>
                        <nav aria-label="Footer — explore">
                            <p className="text-xs font-semibold uppercase tracking-luxe text-stone-muted">Explore</p>
                            <ul className="mt-3 space-y-2 text-sm">
                                <li><Link href="/catalog" className="text-charcoal transition-colors hover:text-rose">The Collection</Link></li>
                                <li><Link href="/ateliers" className="text-charcoal transition-colors hover:text-rose">Our Ateliers</Link></li>
                                <li><Link href="/occasions" className="text-charcoal transition-colors hover:text-rose">Browse by Occasion</Link></li>
                            </ul>
                        </nav>
                        <nav aria-label="Footer — support">
                            <p className="text-xs font-semibold uppercase tracking-luxe text-stone-muted">Support</p>
                            <ul className="mt-3 space-y-2 text-sm">
                                <li><Link href="/how-it-works" className="text-charcoal transition-colors hover:text-rose">How it works</Link></li>
                                <li><Link href="/fittings" className="text-charcoal transition-colors hover:text-rose">Fittings</Link></li>
                                <li><Link href="/help" className="text-charcoal transition-colors hover:text-rose">Help & FAQ</Link></li>
                            </ul>
                        </nav>
                    </div>
                    <div className="border-t border-stone-line px-4 py-5">
                        <p className="mx-auto max-w-7xl text-xs text-stone-muted lg:px-8">
                            © {new Date().getFullYear()} Maison Rentale. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </ToastProvider>
    );
}