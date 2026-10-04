import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import { Truck, Store, QrCode, ShieldCheck, MapPin, Clock, PackageCheck, AlertCircle } from 'lucide-react';

interface Props {
    updated_at: string;
}

export default function ShippingPolicy({ updated_at }: Props) {
    return (
        <StorefrontLayout>
            <Head title="سياسة التسليم والاستلام — Maison Rentale" />

            <div className="bg-stone-50 dark:bg-[#0c0a09] py-12 lg:py-16 text-charcoal dark:text-stone-100" dir="rtl">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4 border border-blue-200 dark:border-blue-900/50">
                            <Truck className="w-4 h-4" />
                            <span>بروتوكول التسليم والشحن المعتمد لـ Paymob</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 dark:text-white mb-4">
                            سياسة الاستلام والتسليم والشحن
                        </h1>
                        <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                            حرصاً على سلامة القطع الفاخرة وضمان مطابقتها التامة للقياسات والمواصفات، توفر ميزون رنتال خياري الاستلام المباشر من الأتيليه والتوصيل المنزلي المأمون.
                        </p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 mt-3">
                            تاريخ السريان وآخر تحديث: {updated_at}
                        </p>
                    </div>

                    {/* Handover Methods */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {/* Method 1: In-Atelier Pickup */}
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs relative overflow-hidden">
                            <div className="absolute top-0 left-0 bg-amber-500 text-white px-3 py-1 text-[11px] font-bold rounded-br-xl">
                                الخيار المفضل للمناسبات
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl w-fit mb-4">
                                <Store className="w-6 h-6" />
                            </div>
                            <h2 className="font-bold text-base text-stone-900 dark:text-white mb-2">
                                1. الاستلام والمعاينة المباشرة من الأتيليه
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                                تجربة ملكية متكاملة تتيح للعميلة زيارة الأتيليه الشريك، وقياس الفستان وتعديله عند اللزوم، ومطابقة الهوية وتسليم القطعة نظيفة ومكوية.
                            </p>
                            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                                <li className="flex items-center gap-2">
                                    <QrCode className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>إبراز بطاقة الاستلام الرقمية (In-Atelier QR Pass) عند الزيارة.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>معاينة سلامة القطعة والاتفاق على تقرير الفحص الأولي.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Method 2: Home Delivery */}
                        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl w-fit mb-4">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h2 className="font-bold text-base text-stone-900 dark:text-white mb-2">
                                2. التوصيل والشحن المباشر (Home Delivery)
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                                متاح لمنتجات الشراء المباشر والقطع الجاهزة وحجوزات الإيجار المتفق عليها، عبر شاحنات نقل مجهزة بشنط حماية خاصة ضد التجعد والتلف.
                            </p>
                            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
                                <li className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>مدة التوصيل: 24 - 48 ساعة داخل القاهرة الكبرى، و48 - 72 ساعة لباقي المحافظات.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>تغليف محكم وعازل للأتربة والرطوبة لضمان وصول القطعة بأبهى حلة.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Detailed Protocols */}
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-8 shadow-xs text-sm sm:text-base leading-relaxed">
                        
                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <QrCode className="w-5 h-5 text-amber-600" />
                                <span>بروتوكول بطاقة الاستلام الرقمية (In-Atelier Pass)</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300">
                                فور إتمام دفع العربون الإلكتروني عبر Paymob، يُنشئ النظام تلقائياً بطاقة استلام رقمية فريدة (QR Pass) تظهر في لوحة تحكم العميلة وتُرسل لبريدها الإلكتروني. تضمن هذه البطاقة:
                            </p>
                            <ol className="list-decimal list-inside space-y-1.5 text-stone-600 dark:text-stone-300 pr-2 mt-2">
                                <li>عدم تسليم القطعة لأي شخص غير صاحب الحجز أو المندوب المفوض.</li>
                                <li>تسجيل وقت وتاريخ التسليم والاستلام بدقة متناهية على النظام.</li>
                                <li>تفعيل بداية مدة الإيجار الفعلية وبدء سريان الحماية التأمينية.</li>
                            </ol>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <MapPin className="w-5 h-5 text-rose-500" />
                                <span>مناطق ونطاق التغطية الجغرافية</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300">
                                تشمل خدماتنا كافة الأتيليهات المعتمدة المنتشرة في: القاهرة (التجمع الخامس، مصر الجديدة، المعادي، الشيخ زايد، 6 أكتوبر)، الجيزة، الإسكندرية، والدلتا، مع خطط توسع مستمرة لتغطية كافة محافظات جمهورية مصر العربية.
                            </p>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                <span>شروط إعادة القطعة المؤجرة بعد المناسبة</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300">
                                تلتزم العميلة بإعادة القطعة في الموعد المحدد بالحجز لتفادي احتساب رسوم تأخير يومية. يتم فحص القطعة المشترك بحضور العميلة أو مندوبها وتحرير إيصال استلام المرتجع.
                            </p>
                        </section>
                    </div>

                    {/* Footer Nav */}
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
                        <Link href="/terms" className="hover:text-rose-600 underline">الشروط والأحكام</Link>
                        <span>•</span>
                        <Link href="/refund-policy" className="hover:text-rose-600 underline">سياسة الاسترجاع والإلغاء</Link>
                        <span>•</span>
                        <Link href="/contact" className="hover:text-rose-600 underline">اتصل بنا والدعم الفني</Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
