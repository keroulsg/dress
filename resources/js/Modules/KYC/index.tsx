/**
 * KYC module — public surface.
 */

import { FileCheck2, FileUp, ShieldAlert } from 'lucide-react';
import * as React from 'react';

import { Badge } from '../../Components/UI/Badge';
import type { KycStatus } from '../../types/contracts';

export type { KycStatus };

export interface IdentityStatusBannerProps {
    status: Pick<KycStatus, 'status' | 'is_verified' | 'rejection_reason'>;
}

/** Banner summarizing the user's identity verification state. */
export function IdentityStatusBanner({ status }: IdentityStatusBannerProps) {
    if (status.is_verified) {
        return (
            <div className="flex items-center gap-3 border border-success/30 bg-success/5 px-4 py-3">
                <FileCheck2 className="h-5 w-5 text-success" aria-hidden="true" />
                <p className="text-sm text-charcoal">
                    <span className="font-semibold">Identity verified.</span> You can rent dresses from any atelier.
                </p>
                <Badge tone="success">Approved</Badge>
            </div>
        );
    }

    if (status.status === 'pending') {
        return (
            <div className="flex items-center gap-3 border border-warning/30 bg-warning/5 px-4 py-3">
                <ShieldAlert className="h-5 w-5 text-warning" aria-hidden="true" />
                <p className="text-sm text-charcoal">
                    <span className="font-semibold">Verification pending.</span> We review documents within 24 hours.
                </p>
                <Badge tone="warning">Under review</Badge>
            </div>
        );
    }

    if (status.status === 'rejected') {
        return (
            <div className="flex items-center gap-3 border border-danger/30 bg-danger/5 px-4 py-3">
                <ShieldAlert className="h-5 w-5 text-danger" aria-hidden="true" />
                <p className="text-sm text-charcoal">
                    <span className="font-semibold">Verification rejected.</span>{' '}
                    {status.rejection_reason ?? 'Please re-submit your documents.'}
                </p>
                <Badge tone="danger">Rejected</Badge>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 border border-stone-line bg-white px-4 py-3">
            <FileUp className="h-5 w-5 text-stone-muted" aria-hidden="true" />
            <p className="text-sm text-charcoal">
                <span className="font-semibold">Verify your identity</span> to unlock bookings.
            </p>
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