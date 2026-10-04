import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { DocumentDropzone, IdentityStatusBanner } from '@/Modules/KYC';
import { Button } from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { CheckCircle2, FileCheck, ShieldAlert, ShieldCheck, UploadCloud } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface KycProps {
    kyc: {
        is_verified: boolean;
        status: 'unverified' | 'pending' | 'verified' | 'rejected';
        rejection_reason?: string | null;
        submitted_at?: string | null;
    };
}

export default function CustomerKyc({ kyc }: KycProps) {
    const { tr } = useLanguage();
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        document_type: 'national_id',
        document_number: '',
        front: null as File | null,
        back: null as File | null,
    });

    const handleFrontSelect = (file: File) => {
        setFrontFile(file);
        setData('front', file);
    };

    const handleBackSelect = (file: File) => {
        setBackFile(file);
        setData('back', file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/kyc/documents', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setFrontFile(null);
                setBackFile(null);
            },
        });
    };

    return (
        <CustomerLayout>
            <Head title={tr('توثيق الهوية الوطنية | Maison Rentale', 'Identity Verification (KYC) | Maison Rentale')} />

            <div className="max-w-3xl space-y-6">
                <div>
                    <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">
                        {tr('توثيق الهوية الوطنية (Identity Verification)', 'Identity Verification & KYC')}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {tr(
                            'مطلوب لمرة واحدة فقط لتمكين استئجار فساتين الهوت كوتور الفاخرة',
                            'One-time verification required to reserve exclusive haute couture gowns'
                        )}
                    </p>
                </div>

                <IdentityStatusBanner status={kyc} />

                {!kyc.is_verified && (
                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-4">
                            <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100">
                                {tr('رفع مستند الهوية (National ID / Passport)', 'Upload Identity Document (ID / Passport)')}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                                    {tr('نوع المستند', 'Document Type')}
                                </label>
                                <select
                                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 text-xs text-stone-900 dark:text-stone-100 focus:border-amber-600 focus:outline-none"
                                    value={data.document_type}
                                    onChange={(e) => setData('document_type', e.target.value)}
                                >
                                    <option value="national_id">{tr('بطاقة الرقم القومي (National ID)', 'National ID Card')}</option>
                                    <option value="passport">{tr('جواز السفر (Passport)', 'Passport')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                                    {tr('رقم المستند / البطاقة', 'Document / ID Number')}
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-600 focus:outline-none"
                                    placeholder={tr('مثال: 29801010000000', 'e.g. 29801010000000')}
                                    value={data.document_number}
                                    onChange={(e) => setData('document_number', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-2">
                                        {tr('صورة الوجه الأمامي للبطاقة', 'Front Side Photo')}
                                    </label>
                                    <DocumentDropzone
                                        label={
                                            frontFile
                                                ? `${tr('تم اختيار:', 'Selected:')} ${frontFile.name}`
                                                : tr('اسحبي الوجه الأمامي أو اضغطي للتصفح', 'Drag front photo or click to browse')
                                        }
                                        onFile={handleFrontSelect}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase mb-2">
                                        {tr('صورة الوجه الخلفي للبطاقة (اختياري)', 'Back Side Photo (Optional)')}
                                    </label>
                                    <DocumentDropzone
                                        label={
                                            backFile
                                                ? `${tr('تم اختيار:', 'Selected:')} ${backFile.name}`
                                                : tr('اسحبي الوجه الخلفي أو اضغطي للتصفح', 'Drag back photo or click to browse')
                                        }
                                        onFile={handleBackSelect}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <Button
                                    type="submit"
                                    variant="champagne"
                                    disabled={processing || !data.front}
                                    className="text-xs"
                                >
                                    <UploadCloud className="h-4 w-4 mr-1" />
                                    {processing ? tr('جاري الرفع…', 'Uploading…') : tr('إرسال للمراجعة والتوثيق', 'Submit for Verification')}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
