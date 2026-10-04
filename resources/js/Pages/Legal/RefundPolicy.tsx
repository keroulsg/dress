import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import { RefreshCcw, ShieldCheck, Clock, AlertCircle, CheckCircle, Scale, DollarSign, Calendar } from 'lucide-react';

interface Props {
    updated_at: string;
}

export default function RefundPolicy({ updated_at }: Props) {
    return (
        <StorefrontLayout>
            <Head title="سياسة الاسترجاع والإلغاء ورد التأمين — Maison Rentale" />

            <div className="bg-stone-50 dark:bg-[#0c0a09] py-12 lg:py-16 text-charcoal dark:text-stone-100" dir="rtl">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4 border border-rose-200 dark:border-rose-900/50">
                            <RefreshCcw className="w-4 h-4" />
                            <span>سياسة الاسترجاع المعتمدة لـ Paymob</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 dark:text-white mb-4">
                            سياسة الاسترجاع والإلغاء واسترداد التأمين
                        </h1>
                        <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                            نلتزم في ميزون رنتال (Maison Rentale) بالشفافية المطلقة والعدالة التامة بين العميلات ودور الأزياء والأتيليهات، وفقاً للقوانين المصرية المنظمة للتجارة وحماية المستهلك.
                        </p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 mt-3">
                            تاريخ السريان وآخر تحديث: {updated_at}
                        </p>
                    </div>

                    {/* Policy Highlights Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit mb-3">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">استرداد التأمين (25%)</h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                مسترد بالكامل 100% خلال 24 ساعة فور إرجاع القطعة والتأكد من سلامتها.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl w-fit mb-3">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">مرونة إلغاء الحجز</h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                استرداد كامل للعربون قبل موعد المناسبة بـ 7 أيام، ونصف القيمة قبل 3-6 أيام.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl w-fit mb-3">
                                <Scale className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-1">حماية المبيعات (14 يوماً)</h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                حق استرجاع للمشتريات الجاهزة خلال 14 يوماً وفق قانون حماية المستهلك المصري.
                            </p>
                        </div>
                    </div>

                    {/* Detailed Clauses */}
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-9 shadow-xs text-sm sm:text-base leading-relaxed">
                        
                        {/* Section 1 */}
                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <Calendar className="w-5 h-5 text-amber-600" />
                                <span>1. سياسة إلغاء حجوزات الإيجار واسترداد العربون الإلكتروني (10%)</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300 mb-3">
                                عند إتمام الحجز عبر المنصة، يتم سداد عربون إلكتروني مؤكد نسبته (10%) من إجمالي قيمة المعاملة عبر بوابة Paymob لحجز القطعة وتجميد تقويمها ومنع تأجيرها لعميلة أخرى:
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm text-right border-collapse">
                                    <thead>
                                        <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
                                            <th className="py-2.5 px-3 font-semibold">وقت طلب الإلغاء</th>
                                            <th className="py-2.5 px-3 font-semibold">نسبة استرداد العربون (10%)</th>
                                            <th className="py-2.5 px-3 font-semibold">الملاحظات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-600 dark:text-stone-300">
                                        <tr>
                                            <td className="py-2.5 px-3 font-medium">قبل 7 أيام فأكثر من تاريخ بدء الحجز</td>
                                            <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">استرداد كامل (100%)</td>
                                            <td className="py-2.5 px-3">يُعاد المبلغ لنفس وسيلة الدفع (البطاقة/المحفظة) خلال 5-10 أيام عمل.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 px-3 font-medium">بين 3 إلى 6 أيام قبل موعد الحجز</td>
                                            <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 font-bold">استرداد جزئي (50%)</td>
                                            <td className="py-2.5 px-3">يُخصم 50% كتعويض تشغيلي للأتيليه لحجز وتجميد فستان المناسبة.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 px-3 font-medium">أقل من 72 ساعة (3 أيام) من موعد الحجز</td>
                                            <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400 font-bold">غير مسترد (0%)</td>
                                            <td className="py-2.5 px-3">نظراً لضياع فرصة تأجير الفستان وتجهيزه وتعديله بالكامل.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                <span>2. شروط وضمانات استرداد مبلغ التأمين (25% Security Deposit)</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300 mb-3">
                                تلتزم المنصة وكافة الأتيليهات الشريكة بأعلى درجات الأمانة المالية فيما يخص مبلغ التأمين المسترد:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-stone-600 dark:text-stone-300 pr-2">
                                <li><strong>سداد التأمين:</strong> يُسدد مبلغ التأمين المتفق عليه (نسبة 25% من قيمة الإيجار) عند استلام الفستان كضمان أمانة.</li>
                                <li><strong>مهلة الفحص والرد (24 ساعة كحد أقصى):</strong> يلتزم الأتيليه بفحص القطعة فور استلامها وإرجاع التأمين كاملاً خلال مدة لا تتجاوز 24 ساعة.</li>
                                <li><strong>التحرير التلقائي الإلزامي:</strong> إذا تخلف الأتيليه عن تسجيل أي تقرير خلال مهلة الـ 24 ساعة، يعتبر التأمين مستحق الرد بالكامل وتتخذ إدارة المنصة الإجراءات اللازمة لرد المبلغ للعميلة فوراً.</li>
                                <li><strong>حماية التجميد الفوري:</strong> تمتلك العميلة زر "الإبلاغ عن حجز التأمين" الذي يقوم فوراً بتجميد مستحقات الأتيليه المالية داخل المنصة لحين فحص الواقعة من الإدارة المركزية.</li>
                            </ul>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <CheckCircle className="w-5 h-5 text-rose-500" />
                                <span>3. سياسة استرجاع واستبدال المشتريات المباشرة (Direct Sale)</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300 mb-3">
                                عملاً بأحكام قانون حماية المستهلك المصري رقم 181 لسنة 2018:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-stone-600 dark:text-stone-300 pr-2">
                                <li>يحق للعميلة استرجاع أو استبدال المنتجات المشتراة شراءً مباشراً (فساتين جاهزة، عبايات، أحذية، حقائب، مجوهرات) خلال <strong>14 يوماً</strong> من تاريخ الاستلام، بشرط أن تكون القطعة بحالتها الأصلية، غير مستعملة، وفي غلافها وبطاقات الأسعار الأصلية.</li>
                                <li><strong>الاستثناء القانوني:</strong> القطع المصممة أو المفصلة خصيصاً بناءً على طلب العميلة وبمقاسات شخصية خاصة (Made-to-Measure / Custom Couture) لا تخضع للإرجاع إلا في حال وجود عيب صناعة جوهري مثبت ومخالف للمواصفات المتفق عليها.</li>
                            </ul>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                <span>4. طريقة استرداد الأموال والمدد الزمنية البنكية</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300">
                                تتم عمليات رد المبالغ الإلكترونية (Refunds) إلى نفس البطاقة البنكية أو المحفظة الإلكترونية التي تم الدفع بها عبر بوابة Paymob. تظهر المبالغ في كشف حساب العميلة خلال 5 إلى 14 يوم عمل وفقاً لقواعد البنك المصدر للبطاقة.
                            </p>
                        </section>
                    </div>

                    {/* Footer Nav */}
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
                        <Link href="/terms" className="hover:text-rose-600 underline">الشروط والأحكام</Link>
                        <span>•</span>
                        <Link href="/shipping-policy" className="hover:text-rose-600 underline">سياسة التسليم والاستلام</Link>
                        <span>•</span>
                        <Link href="/contact" className="hover:text-rose-600 underline">اتصل بنا والدعم الفني</Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
