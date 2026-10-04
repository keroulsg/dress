import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import { ShieldCheck, Lock, EyeOff, FileText, Database, UserCheck } from 'lucide-react';

interface Props {
    updated_at: string;
}

export default function Privacy({ updated_at }: Props) {
    return (
        <StorefrontLayout>
            <Head title="سياسة الخصوصية وأمن البيانات — Maison Rentale" />

            <div className="bg-stone-50 dark:bg-[#0c0a09] py-12 lg:py-16 text-charcoal dark:text-stone-100" dir="rtl">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 border border-emerald-200 dark:border-emerald-900/50">
                            <Lock className="w-4 h-4" />
                            <span>سرية تامة وتشفير بنكي</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 dark:text-white mb-4">
                            سياسة الخصوصية وحماية البيانات
                        </h1>
                        <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                            نلتزم في ميزون رنتال (Maison Rentale) بأعلى معايير الحماية والأمان لبياناتكِ الشخصية، ووثائق إثبات الهوية (KYC)، وسجلات المعاملات المالية.
                        </p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 mt-3">
                            آخر تحديث للوثيقة: {updated_at}
                        </p>
                    </div>

                    {/* Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-4">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                                <EyeOff className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-sm mb-1">خصوصية وثائق الهوية</h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                    تُحفظ صور البطاقات في مسارات خاصة مشفرة ولا تتاح إلا لأطراف المعاملة للتحقق الأمني.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-4">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-sm mb-1">تشفير المدفوعات</h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                    معالجة بطاقات الدفع مطابقة لمعايير PCI-DSS دون تخزين أرقام بطاقاتك البنكية على خوادمنا.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-start gap-4">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                                <UserCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-sm mb-1">التحكم بالبيانات</h2>
                                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                                    يحق لكِ في أي وقت طلب مراجعة بياناتك المسجلة أو تحديثها أو طلب حذف الحساب.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Sections */}
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-10 space-y-8 shadow-xs leading-relaxed text-sm sm:text-base">
                        
                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <Database className="w-5 h-5 text-rose-500" />
                                <span>1. البيانات التي نجمعها</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300 mb-2">
                                نقوم بجمع البيانات الضرورية فقط لتشغيل المنظومة وتأمين المعاملات بين العميلات والمتاجر:
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 text-stone-600 dark:text-stone-300 pr-2">
                                <li><strong>بيانات التسجيل الأساسية:</strong> الاسم، رقم الهاتف، عنوان البريد الإلكتروني، وعنوان التوصيل أو القياس.</li>
                                <li><strong>بيانات التوثيق والتحقق من الهوية (KYC):</strong> صورة بطاقة الرقم القومي أو جواز السفر للمستأجرة أو مالكة الأتيليه لضمان حقوق ومقتنيات الطرفين أثناء فترة الحيازة.</li>
                                <li><strong>سجلات الطلبات والحجوزات:</strong> تفاصيل الفساتين، فترات الإيجار، وتواريخ المعاينة والتسليم.</li>
                            </ul>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                <span>2. حماية مستندات الهوية (KYC Policy)</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300">
                                نظراً لطبيعة القطع الثمينة وفساتين الزفاف والمجوهرات، يُشترط تقديم إثبات هوية رسمي. تُحفظ هذه الوثائق في خوادم سحابية محمية بصلاحيات وصول صارمة ومقيدة:
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 text-stone-600 dark:text-stone-300 pr-2 mt-2">
                                <li>لا يُسمح بالاطلاع على الوثائق إلا لمدير المنصة المعني بالاعتماد، ولصاحبة الأتيليه المرتبطة بالحجز المؤكد فقط.</li>
                                <li>لا يتم استخدام الوثائق أو مشاركتها لأي أغراض إعلانية أو تجارية قط تحت أي ظرف.</li>
                            </ul>
                        </section>

                        <hr className="border-stone-100 dark:border-stone-800" />

                        <section>
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-3">
                                <Lock className="w-5 h-5 text-blue-500" />
                                <span>3. المدفوعات والمعاملات المالية</span>
                            </h2>
                            <p className="text-stone-600 dark:text-stone-300">
                                تتم كافة المعاملات المالية الإلكترونية ورسوم الحجز عبر بوابات الدفع الرسمية المعتمدة من البنك المركزي المصري. لا تقوم المنصة بتخزين أي بيانات حساسة للبطاقات البنكية، مثل رمز الأمان (CVV) أو كلمات المرور السرية.
                            </p>
                        </section>

                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-8 text-center">
                        <Link 
                            href="/terms" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-black text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white rounded-full font-medium text-sm transition-colors shadow-sm"
                        >
                            <span>الاطلاع على شروط الاستخدام والضمان</span>
                        </Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
