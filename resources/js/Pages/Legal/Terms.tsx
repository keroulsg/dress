import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import { ShieldCheck, Scale, Clock, AlertTriangle, CheckCircle2, Lock, Sparkles, HeartHandshake } from 'lucide-react';

interface Props {
    updated_at: string;
}

export default function Terms({ updated_at }: Props) {
    return (
        <StorefrontLayout>
            <Head title="الشروط والأحكام وسياسة الضمان — Maison Rentale" />

            <div className="bg-stone-50 dark:bg-[#0c0a09] py-12 lg:py-16 text-charcoal dark:text-stone-100" dir="rtl">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4 border border-rose-200 dark:border-rose-900/50">
                            <Scale className="w-4 h-4" />
                            <span>ميثاق الثقة والأمان القانوني</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 dark:text-white mb-4">
                            شروط الاستخدام وضمان التأمين
                        </h1>
                        <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                            أهلاً بكِ في ميزون رنتال (Maison Rentale) — المنصة الرائدة لقطاع الموضة والأزياء الراقية، فساتين السهرة والزفاف، العبايات والقفاطين، والإكسسوارات الفاخرة (تأجير وشراء فوري).
                        </p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 mt-3">
                            آخر تحديث للوثيقة: {updated_at}
                        </p>
                    </div>

                    {/* Quick Guarantee Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-4">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-sm mb-1">مهلة فحص 24 ساعة</h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                    يلتزم المتجر بفحص القطعة وتأكيد رد التأمين خلال 24 ساعة من الاستلام كحد أقصى.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-4">
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-sm mb-1">حماية التجميد الفوري</h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                    يحق للعميلة تجميد مستحقات المتجر وإيقاف التحويلات فوراً عند أي مماطلة برد التأمين.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-4">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-sm mb-1">إثباتات التلف الموثقة</h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                    لا يُخصم أي قرش من التأمين إلا بتقرير مصور رسمي وفاتورة إصلاح معتمدة من الإدارة.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Legal Sections */}
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-10 shadow-xs leading-relaxed text-sm sm:text-base">
                        
                        {/* Section 1 */}
                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <Sparkles className="w-5 h-5 text-rose-500" />
                                <span>1. نطاق المنصة ومنظومة الأناقة المزدوجة</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300 mb-3">
                                تتيح منصة ميزون رنتال للمستخدمين استكشاف وتأجير وشراء أرقى تصاميم الأزياء والمناسبات من الأتيليهات المعتمدة، ومصممي البراندات اليدوية، بما يشمل:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 pr-2">
                                <li>فساتين الزفاف والخطوبة والسهرة الراقية.</li>
                                <li>العبايات والقفاطين الخليجية والمغربية الفاخرة.</li>
                                <li>مجوهرات الزفاف، التيجان، والأطقم الملكية.</li>
                                <li>حقائب السهرة وأحذية المناسبات الراقية.</li>
                                <li>قطع الكوتور المصنوعة يدوياً وتصاميم المصممين المستقلين.</li>
                            </ul>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        {/* Section 2 */}
                        <section id="deposit-escrow">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3 text-rose-600 dark:text-rose-400">
                                <ShieldCheck className="w-5 h-5" />
                                <span>2. بروتوكول حماية واسترداد مبلغ التأمين (Deposit Return & Escrow)</span>
                            </h2>
                            <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-4 mb-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                                <strong>تنويه حاسم:</strong> صُممت سياسات المنصة لضمان عدم ضياع أي مبالغ تأمين للعميلات، وإلزام الأتيليهات بإجراءات شفافة وواضحة.
                            </div>
                            <ol className="list-decimal list-inside space-y-3 text-stone-600 dark:text-stone-300 pr-2">
                                <li>
                                    <strong>سداد التأمين:</strong> يتم دفع مبلغ التأمين النقدي المتفق عليه عند استلام الفستان / القطعة كضمان لسلامتها أثناء فترة الاستخدام.
                                </li>
                                <li>
                                    <strong>نافذة الفحص (24 ساعة):</strong> فور إعادة القطعة للمتجر وتغيير حالتها إلى "قيد فحص المرتجع"، يبدأ عداد زمني مدته 24 ساعة. يجب على المتجر خلال هذه المهلة:
                                    <ul className="list-disc list-inside pr-6 mt-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                                        <li>تأكيد استلام القطعة بحالة سليمة والإفراج الفوري عن التأمين للعميلة.</li>
                                        <li>أو فتح بلاغ نزاع رسمي مرفقاً بصور تثبت التلفيات وتكلفة الإصلاح التقديرية.</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>الإغلاق التلقائي (Auto-Resolution):</strong> إذا لم يقم المتجر بتسجيل أي بلاغ خلال مهلة الـ 24 ساعة، يعتبر التأمين مستحق الرد بالكامل فوراً، وتُغلق المعاملة كعملية ناجحة.
                                </li>
                                <li>
                                    <strong>تجميد الأرباح (Payout Freeze):</strong> في حال مماطلة المتجر أو امتناعه عن رد التأمين، يتيح زر "الإبلاغ عن حجز التأمين" في لوحة تحكم العميلة تجميد كافة مستحقات المتجر وأرباحه لدى المنصة تلقائياً لحين حسم النزاع.
                                </li>
                            </ol>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <span>3. سياسة التلفيات والإصلاح</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300 mb-2">
                                يُفرّق النظام بدقة بين الاستهلاك الطبيعي المعتاد والتلفيات الجسيمة:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-stone-600 dark:text-stone-300 pr-2 text-sm">
                                <li><strong>الاستهلاك المعتاد (مغطى مجاناً):</strong> البقع السطحية القابلة للإزالة بالتنظيف الجاف، أو فك خياطة بسيط غير ظاهر، يشملها رسم التنظيف والتجهيز.</li>
                                <li><strong>التلفيات غير القابلة للإصلاح أو الحروق أو التمزق الشديد:</strong> يتم تقدير تكلفة الإصلاح أو تعويض القيمة من مبلغ التأمين المحجوز فقط وفق تقرير فني مصور ومعتمد.</li>
                            </ul>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <HeartHandshake className="w-5 h-5 text-rose-500" />
                                <span>4. سياسة الشراء والتملك الفوري (Direct E-Commerce Sale)</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300 mb-2">
                                عند اختيار "شراء وتملك فوري":
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-300 pr-2 text-sm">
                                <li>لا يُطبق أي مبلغ تأمين مسترد (0 جنيه مصري تأمين).</li>
                                <li>تكون القطعة ملكاً خالصاً للمشترية فور السداد والاستلام.</li>
                                <li>تخضع المنتجات الجاهزة لسياسة استرجاع أو استبدال لمدة 14 يوماً وفق قانون حماية المستهلك، ما لم تكن القطعة مفصلة خصيصاً بمقاسات شخصية (Custom-made).</li>
                            </ul>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span>5. سياسة العربون وسداد الرسوم</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300 text-sm">
                                يتم سداد عربون الحجز والرسوم التشغيلية (10%) إلكترونياً عبر بوابات الدفع المعتمدة (فيزا، ماستركارد، ميزة، المحافظ الإلكترونية)، ويتم سداد باقي القيمة (90%) عند الاستلام والتسليم مباشرة.
                            </p>
                        </section>

                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-8 text-center">
                        <Link 
                            href="/catalog" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-black text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white rounded-full font-medium text-sm transition-colors shadow-sm"
                        >
                            <span>تصفح المجموعات الفاخرة</span>
                        </Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
