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
            <div className="flex min-h-screen flex-col bg-ivory dark:bg-[#0c0a09] text-charcoal dark:text-stone-100 transition-colors duration-200">
                <StorefrontNavbar user={user} />

                <main className="flex-1">{children}</main>

                <footer className="border-t border-stone-line dark:border-stone-800 bg-white dark:bg-stone-950">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-4 lg:px-8">
                        <div className="lg:col-span-2">
                            <p className="font-display text-2xl text-charcoal dark:text-stone-100">
                                Maison <span className="text-rose dark:text-rose-400">Rentale</span>
                            </p>
                            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-muted dark:text-stone-400">
                                Borrow designer pieces for life's unforgettable moments. Every rental is
                                cleaned, pressed, and delivered to your door.
                            </p>
                        </div>
                        <nav aria-label="Footer — explore">
                            <p className="text-xs font-semibold uppercase tracking-luxe text-stone-muted dark:text-stone-500">Explore</p>
                            <ul className="mt-3 space-y-2 text-sm">
                                <li><Link href="/catalog" className="text-charcoal dark:text-stone-300 transition-colors hover:text-rose dark:hover:text-rose-400">The Collection</Link></li>
                                <li><Link href="/ateliers" className="text-charcoal dark:text-stone-300 transition-colors hover:text-rose dark:hover:text-rose-400">Our Ateliers</Link></li>
                                <li><Link href="/occasions" className="text-charcoal dark:text-stone-300 transition-colors hover:text-rose dark:hover:text-rose-400">Browse by Occasion</Link></li>
                            </ul>
                        </nav>
                        <nav aria-label="Footer — support">
                            <p className="text-xs font-semibold uppercase tracking-luxe text-stone-muted dark:text-stone-500">Legal & Support</p>
                            <ul className="mt-3 space-y-2 text-sm">
                                <li><Link href="/terms" className="text-charcoal dark:text-stone-300 transition-colors hover:text-rose dark:hover:text-rose-400">الشروط والأحكام (Terms)</Link></li>
                                <li><Link href="/privacy" className="text-charcoal dark:text-stone-300 transition-colors hover:text-rose dark:hover:text-rose-400">سياسة الخصوصية (Privacy)</Link></li>
                                <li><Link href="/refund-policy" className="text-charcoal dark:text-stone-300 transition-colors hover:text-rose dark:hover:text-rose-400">سياسة الاسترجاع والإلغاء (Refund Policy)</Link></li>
                                <li><Link href="/shipping-policy" className="text-charcoal dark:text-stone-300 transition-colors hover:text-rose dark:hover:text-rose-400">سياسة التسليم والاستلام (Shipping & Pickup)</Link></li>
                                <li><Link href="/contact" className="text-charcoal dark:text-stone-300 transition-colors hover:text-rose dark:hover:text-rose-400">اتصل بنا والدعم (Contact Us)</Link></li>
                            </ul>
                        </nav>
                    </div>
                    <div className="border-t border-stone-line dark:border-stone-800 px-4 py-5 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto lg:px-8 text-xs text-stone-muted dark:text-stone-500 gap-2">
                        <p>© {new Date().getFullYear()} Maison Rentale. جميع الحقوق محفوظة — منصة الموضة والأناقة الفاخرة.</p>
                        <div className="flex flex-wrap gap-4 text-center justify-center">
                            <Link href="/terms" className="hover:text-rose dark:hover:text-rose-400 underline">الشروط والأحكام</Link>
                            <Link href="/privacy" className="hover:text-rose dark:hover:text-rose-400 underline">الخصوصية</Link>
                            <Link href="/refund-policy" className="hover:text-rose dark:hover:text-rose-400 underline">الاسترجاع والإلغاء</Link>
                            <Link href="/shipping-policy" className="hover:text-rose dark:hover:text-rose-400 underline">الشحن والتسليم</Link>
                            <Link href="/contact" className="hover:text-rose dark:hover:text-rose-400 underline">اتصل بنا</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </ToastProvider>
    );
}