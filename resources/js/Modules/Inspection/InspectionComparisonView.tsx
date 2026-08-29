/**
 * Pre-dispatch vs post-return comparison for atelier sign-off. Shows baseline
 * and returned photos side by side, an itemized deduction breakdown, and the
 * refundable deposit summary with approve / dispute actions.
 */

import { Camera, CheckCircle2, Scale } from 'lucide-react';
import * as React from 'react';

import { Badge } from '../../Components/UI/Badge';
import { Button } from '../../Components/UI/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../Components/UI/Card';
import { Modal, ModalContent, ModalTitle } from '../../Components/UI/Modal';
import { formatCurrency } from '../../Lib/currency';
import { HighResGalleryModal, type GalleryImage } from '../Media';

export interface DeductionLine {
    label: string;
    amount: string;
    currency: string;
}

export interface InspectionComparisonViewProps {
    prePhotos?: string[];
    postPhotos?: string[];
    deductions: DeductionLine[];
    totalDeduction: { amount: string; currency: string };
    refundableDeposit: { amount: string; currency: string };
    onApprove?: () => void;
    approving?: boolean;
    onDispute?: () => void;
}

interface PhotoPanelProps {
    title: string;
    photos: string[];
    onOpen: () => void;
}

function PhotoPanel({ title, photos, onOpen }: PhotoPanelProps) {
    const hasPhotos = photos.length > 0;

    return (
        <figure className="border border-stone-line bg-white shadow-subtle">
            <figcaption className="flex items-center justify-between border-b border-stone-line px-4 py-3">
                <span className="font-ui text-xs font-semibold uppercase tracking-luxe text-charcoal">{title}</span>
                <Badge tone={hasPhotos ? 'success' : 'neutral'}>
                    {hasPhotos ? `${photos.length} photo${photos.length === 1 ? '' : 's'}` : 'No photos'}
                </Badge>
            </figcaption>
            {hasPhotos ? (
                <button
                    type="button"
                    onClick={onOpen}
                    aria-label={`Open ${title} gallery`}
                    className="group block w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-inset"
                >
                    <img
                        src={photos[0]}
                        alt={`${title} — photo 1`}
                        className="aspect-[4/3] w-full object-cover transition-opacity group-hover:opacity-90"
                    />
                </button>
            ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed border-stone-line bg-ivory text-stone-muted">
                    <Camera className="h-6 w-6" aria-hidden="true" />
                    <span className="text-xs">No {title} on record</span>
                </div>
            )}
        </figure>
    );
}

/** Editorial comparison and sign-off surface for the return inspection. */
export function InspectionComparisonView({
    prePhotos = [],
    postPhotos = [],
    deductions,
    totalDeduction,
    refundableDeposit,
    onApprove,
    approving = false,
    onDispute,
}: InspectionComparisonViewProps) {
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [lightbox, setLightbox] = React.useState<{ images: GalleryImage[] } | null>(null);

    const handleApprove = (): void => {
        setConfirmOpen(false);
        onApprove?.();
    };

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
                <PhotoPanel
                    title="Pre-Dispatch Baseline"
                    photos={prePhotos}
                    onOpen={() =>
                        setLightbox({
                            images: prePhotos.map((src, index) => ({
                                src,
                                alt: `Pre-dispatch baseline photo ${index + 1}`,
                            })),
                        })
                    }
                />
                <PhotoPanel
                    title="Post-Return"
                    photos={postPhotos}
                    onOpen={() =>
                        setLightbox({
                            images: postPhotos.map((src, index) => ({
                                src,
                                alt: `Post-return photo ${index + 1}`,
                            })),
                        })
                    }
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-display text-xl">Deduction breakdown</CardTitle>
                    <CardDescription>Itemized findings from the return inspection.</CardDescription>
                </CardHeader>
                <CardContent>
                    {deductions.length === 0 ? (
                        <p className="py-6 text-center text-sm text-stone-muted">No deductions recorded.</p>
                    ) : (
                        <ul>
                            {deductions.map((line, index) => (
                                <li
                                    key={`${line.label}-${index}`}
                                    className="flex items-baseline justify-between border-b border-stone-line py-2.5 text-sm last:border-0"
                                >
                                    <span className="text-charcoal">{line.label}</span>
                                    <span className="font-ui font-medium text-charcoal">
                                        {formatCurrency(line.amount, line.currency)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-2 flex items-baseline justify-between border-t-2 border-charcoal/10 pt-3">
                        <span className="font-ui text-sm font-semibold uppercase tracking-luxe text-charcoal">
                            Total deduction
                        </span>
                        <span className="font-display text-xl font-semibold text-rose">
                            {formatCurrency(totalDeduction.amount, totalDeduction.currency)}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col items-center gap-5 border border-champagne/40 bg-champagne/10 px-6 py-5 sm:flex-row sm:justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-luxe text-stone-muted">Refundable deposit</p>
                    <p className="font-display text-3xl font-semibold text-rose-deep">
                        {formatCurrency(refundableDeposit.amount, refundableDeposit.currency)}
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={approving}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        {approving ? 'Approving…' : 'Approve deductions'}
                    </Button>
                    <Button variant="outline" onClick={onDispute}>
                        <Scale className="h-4 w-4" aria-hidden="true" />
                        Open dispute
                    </Button>
                </div>
            </div>

            <Modal open={confirmOpen} onOpenChange={setConfirmOpen}>
                <ModalContent className="max-w-md">
                    <ModalTitle className="font-display text-2xl font-semibold tracking-luxe text-charcoal">
                        Approve deductions?
                    </ModalTitle>
                    <p className="mt-3 text-sm text-stone-muted">
                        Confirm the total deduction of{' '}
                        {formatCurrency(totalDeduction.amount, totalDeduction.currency)}. The refundable deposit of{' '}
                        {formatCurrency(refundableDeposit.amount, refundableDeposit.currency)} will be issued.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleApprove} disabled={approving}>
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            {approving ? 'Approving…' : 'Confirm approval'}
                        </Button>
                    </div>
                </ModalContent>
            </Modal>

            {lightbox ? (
                <HighResGalleryModal
                    images={lightbox.images}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) {
                            setLightbox(null);
                        }
                    }}
                    initialIndex={0}
                />
            ) : null}
        </div>
    );
}