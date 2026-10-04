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

                <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-200">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
                        {/* Col 1: Brand & Entity */}
                        <div className="space-y-4">
                            <Link href="/" className="inline-block font-display text-2xl font-bold tracking-tight text-charcoal dark:text-stone-100">
                                Maison <span className="text-rose-600 dark:text-rose-400">Rentale</span>
                            </Link>
                            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                المنصة الأولى في مصر لتأجير وشراء فساتين الهوت كوتور والزفاف، العبايات والمجوهرات الفاخرة، مع ضمان موثق لاسترداد التأمين خلال 24 ساعة.
                            </p>
                            <div className="pt-2 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                                <p className="font-semibold text-stone-900 dark:text-stone-100">شركة ميزون رنتال لحلول الأزياء الراقية (ش.ذ.م.م)</p>
                                <p className="text-stone-400">المقر الرئيسي: مصر</p>
                            </div>
                        </div>

                        {/* Col 2: Navigation */}
                        <nav aria-label="Footer — explore">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">الأقسام والمجموعات</p>
                            <ul className="mt-3.5 space-y-2 text-xs">
                                <li><Link href="/catalog" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">المجموعة الكاملة (All Collection)</Link></li>
                                <li><Link href="/catalog?category=wedding-evening-gowns" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">فساتين زفاف وسهرة (Gowns)</Link></li>
                                <li><Link href="/catalog?category=luxury-abayas-kaftans" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">عبايات وقفاطين فاخرة (Abayas)</Link></li>
                                <li><Link href="/catalog?category=bridal-jewelry-accessories" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">مجوهرات وإكسسوارات زفاف</Link></li>
                                <li><Link href="/catalog?mode=sale" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">شراء وتملك فوري (Direct Buy)</Link></li>
                                <li><Link href="/#how-it-works" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">كيف يعمل الموقع (How it Works)</Link></li>
                            </ul>
                        </nav>

                        {/* Col 3: Legal & Paymob Compliance */}
                        <nav aria-label="Footer — support">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">السياسات والامتثال (Paymob)</p>
                            <ul className="mt-3.5 space-y-2 text-xs">
                                <li><Link href="/terms" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">الشروط والأحكام (Terms of Service)</Link></li>
                                <li><Link href="/privacy" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">سياسة الخصوصية (Privacy Policy)</Link></li>
                                <li><Link href="/refund-policy" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">سياسة الاسترجاع والإلغاء (Refund Policy)</Link></li>
                                <li><Link href="/shipping-policy" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">سياسة الاستلام والشحن (Shipping Policy)</Link></li>
                                <li><Link href="/contact" className="text-stone-600 dark:text-stone-300 transition-colors hover:text-amber-600 dark:hover:text-amber-400">اتصل بنا والدعم الفني (Contact Us)</Link></li>
                            </ul>
                        </nav>

                        {/* Col 4: Contact & Direct Numbers */}
                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">التواصل والدعم الفني</p>
                            <div className="space-y-2 text-xs">
                                <p className="text-stone-500 dark:text-stone-400">
                                    المقر: <span className="font-semibold text-stone-800 dark:text-stone-200">مصر</span>
                                </p>
                                <div>
                                    <span className="text-stone-500 dark:text-stone-400 block mb-0.5">البريد الإلكتروني:</span>
                                    <a href="mailto:keroulsgamal13@gmail.com" className="font-medium text-amber-700 dark:text-amber-400 hover:underline">
                                        keroulsgamal13@gmail.com
                                    </a>
                                </div>
                                <div>
                                    <span className="text-stone-500 dark:text-stone-400 block mb-0.5">أرقام الهاتف:</span>
                                    <div className="flex flex-col gap-1 font-mono font-bold text-stone-800 dark:text-stone-200">
                                        <a href="tel:01156231162" className="hover:text-amber-600">01156231162</a>
                                        <a href="tel:01044200583" className="hover:text-amber-600">01044200583</a>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <a
                                        href="https://wa.me/201220821706"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                                    >
                                        <span>محادثة واتساب: 01220821706</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-stone-200 dark:border-stone-800 px-4 py-5 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto lg:px-8 text-xs text-stone-500 dark:text-stone-400 gap-3">
                        <p>© {new Date().getFullYear()} Maison Rentale. شركة ميزون رنتال لحلول الأزياء الراقية (ش.ذ.م.م) — مصر. جميع الحقوق محفوظة.</p>
                        <div className="flex flex-wrap gap-4 text-center justify-center">
                            <Link href="/terms" className="hover:text-amber-600 dark:hover:text-amber-400 underline">الشروط والأحكام</Link>
                            <Link href="/privacy" className="hover:text-amber-600 dark:hover:text-amber-400 underline">الخصوصية</Link>
                            <Link href="/refund-policy" className="hover:text-amber-600 dark:hover:text-amber-400 underline">الاسترجاع والإلغاء</Link>
                            <Link href="/shipping-policy" className="hover:text-amber-600 dark:hover:text-amber-400 underline">الشحن والاستلام</Link>
                            <Link href="/contact" className="hover:text-amber-600 dark:hover:text-amber-400 underline">اتصل بنا</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </ToastProvider>
    );
}