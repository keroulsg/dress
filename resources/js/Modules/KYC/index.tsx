/**
 * KYC module — public surface.
 */

import { FileCheck2, FileUp, ShieldAlert } from 'lucide-react';
import * as React from 'react';

import { Badge } from '../../Components/UI/Badge';
import type { KycStatus } from '../../types/contracts';

export type { KycStatus };

import { useLanguage } from '../../Contexts/LanguageContext';

export interface IdentityStatusBannerProps {
    status: Pick<KycStatus, 'status' | 'is_verified' | 'rejection_reason'>;
}

/** Banner summarizing the user's identity verification state. */
export function IdentityStatusBanner({ status }: IdentityStatusBannerProps) {
    const { tr } = useLanguage();

    if (status.is_verified || (status.status as string) === 'approved' || (status.status as string) === 'verified') {
        return (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3">
                <div className="flex items-center gap-3">
                    <FileCheck2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    <p className="text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        <span className="font-semibold">{tr('تم التحقق من الهوية بنجاح.', 'Identity verified.')}</span>{' '}
                        {tr('حسابك موثق ومؤهل لاستئجار وشراء الفساتين من كافة الأتيليهات.', 'You can rent dresses from any atelier.')}
                    </p>
                </div>
                <Badge tone="success">{tr('موثق ومعتمد', 'Approved')}</Badge>
            </div>
        );
    }

    if (status.status === 'pending') {
        return (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                    <p className="text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        <span className="font-semibold">{tr('طلب التحقق قيد المراجعة.', 'Verification pending.')}</span>{' '}
                        {tr('يقوم فريق الرقابة بفحص المستندات خلال 24 ساعة.', 'We review documents within 24 hours.')}
                    </p>
                </div>
                <Badge tone="warning">{tr('قيد المراجعة', 'Under review')}</Badge>
            </div>
        );
    }

    if (status.status === 'rejected') {
        return (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-3">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                    <p className="text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        <span className="font-semibold">{tr('تم رفض مستندات التحقق.', 'Verification rejected.')}</span>{' '}
                        {status.rejection_reason ?? tr('يرجى إعادة رفع المستندات بوضوح.', 'Please re-submit your documents.')}
                    </p>
                </div>
                <Badge tone="danger">{tr('مرفوض', 'Rejected')}</Badge>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-3 shadow-xs">
            <div className="flex items-center gap-3">
                <FileUp className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                <p className="text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                    <span className="font-semibold">{tr('يرجى توثيق الهوية (KYC)', 'Verify your identity')}</span>{' '}
                    {tr('لتأكيد حجوزاتك وحماية عمليات التأجير.', 'to unlock instant bookings and rentals.')}
                </p>
            </div>
            <Badge tone="champagne">{tr('مطلوب التوثيق', 'Action needed')}</Badge>
        </div>
    );
}


export interface DocumentDropzoneProps {
    label?: string;
    accept?: string;
    onFile: (file: File) => void;
}

/** Accessible drag-and-drop document uploader. Files never leave private storage. */
export function DocumentDropzone({ label = 'Drag & drop or browse', accept = 'image/*,.pdf', onFile }: DocumentDropzoneProps) {
    const [dragging, setDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={label}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    inputRef.current?.click();
                }
            }}
            onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files[0];

                if (file) {
                    onFile(file);
                }
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? 'border-champagne bg-champagne/10' : 'border-stone-line bg-white hover:border-champagne/60'
            }`}
        >
            <FileUp className="h-6 w-6 text-champagne" aria-hidden="true" />
            <p className="text-sm font-medium text-charcoal">{label}</p>
            <p className="text-xs text-stone-muted">JPEG, PNG, WEBP or PDF · max 5 MB</p>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                        onFile(file);
                    }

                    event.target.value = '';
                }}
            />
        </div>
    );
}