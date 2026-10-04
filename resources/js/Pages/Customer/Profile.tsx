import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Check, Mail, Phone, User as UserIcon } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface ProfileProps {
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
}

export default function CustomerProfile({ user }: ProfileProps) {
    const { tr } = useLanguage();

    const { data, setData, patch, processing } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/profile');
    };

    return (
        <CustomerLayout>
            <Head title={tr('الملف الشخصي | Maison Rentale', 'Profile Settings | Maison Rentale')} />

            <div className="max-w-2xl space-y-6">
                <div>
                    <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">
                        {tr('الملف الشخصي (Profile Settings)', 'Personal Profile Settings')}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {tr(
                            'تعديل بيانات الحساب، البريد الإلكتروني، ورقم الهاتف للتوصيل',
                            'Update your contact details, delivery phone number, and personal preferences'
                        )}
                    </p>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                                {tr('الاسم بالكامل', 'Full Name')}
                            </label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                                {tr('البريد الإلكتروني', 'Email Address')}
                            </label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                                {tr('رقم الهاتف (للتوصيل والتنسيق)', 'Phone Number (For Delivery Coordination)')}
                            </label>
                            <Input
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+20 100 000 0000"
                                className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                            />
                        </div>

                        <div className="border-t border-stone-100 dark:border-stone-800 pt-4 flex justify-end">
                            <Button type="submit" variant="champagne" disabled={processing} className="text-xs">
                                <Check className="h-4 w-4 mr-1" />
                                {processing ? tr('جاري الحفظ…', 'Saving…') : tr('حفظ التعديلات', 'Save Changes')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </CustomerLayout>
    );
}
