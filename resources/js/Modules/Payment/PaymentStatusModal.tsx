/**
 * Payment status modal — authorizing / success / declined feedback.
 */

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import * as React from 'react';

import { Button } from '../../Components/UI/Button';
import { Modal, ModalContent, ModalDescription, ModalTitle } from '../../Components/UI/Modal';

export type PaymentStatus = 'processing' | 'success' | 'declined';

export interface PaymentStatusModalProps {
    open: boolean;
    status: PaymentStatus;
    amount?: string;
    reference?: string | null;
    message?: string | null;
    onClose?: () => void;
    onRetry?: () => void;
}

const STATUS_TITLE_ID = 'payment-status-title';

export function PaymentStatusModal({
    open,
    status,
    amount,
    reference,
    message,
    onClose,
    onRetry,
}: PaymentStatusModalProps) {
    const handleOpenChange = (next: boolean): void => {
        if (!next) {
            onClose?.();
        }
    };

    return (
        <Modal open={open} onOpenChange={handleOpenChange}>
            <ModalContent
                showCloseButton={status !== 'processing'}
                aria-labelledby={STATUS_TITLE_ID}
                aria-live="assertive"
                className="max-w-sm text-center"
            >
                {status === 'processing' ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <Loader2 className="h-10 w-10 animate-spin text-champagne" aria-hidden="true" />
                        <ModalTitle id={STATUS_TITLE_ID} className="font-display text-2xl text-charcoal">
                            Authorizing payment…
                        </ModalTitle>
                        <ModalDescription className="text-sm text-stone-muted">
                            Please do not close this window while we confirm your payment.
                        </ModalDescription>
                    </div>
                ) : null}

                {status === 'success' ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-champagne/15">
                            <CheckCircle2 className="h-7 w-7 text-champagne" aria-hidden="true" />
                        </div>
                        <ModalTitle id={STATUS_TITLE_ID} className="font-display text-2xl text-charcoal">
                            Payment successful
                        </ModalTitle>
                        <ModalDescription className="text-sm text-stone-muted">
                            {amount !== undefined && amount !== '' ? (
                                <span>{amount}</span>
                            ) : (
                                'Thank you. Your payment has been confirmed.'
                            )}
                        </ModalDescription>
                        {reference !== null && reference !== undefined && reference !== '' ? (
                            <p className="break-all font-mono text-xs tracking-wider text-stone-muted">
                                Ref: {reference}
                            </p>
                        ) : null}
                        <Button type="button" variant="primary" className="mt-2 w-full" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                ) : null}

                {status === 'declined' ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose/10">
                            <XCircle className="h-7 w-7 text-rose" aria-hidden="true" />
                        </div>
                        <ModalTitle id={STATUS_TITLE_ID} className="font-display text-2xl text-charcoal">
                            Payment declined
                        </ModalTitle>
                        <ModalDescription className="text-sm text-stone-muted">
                            {message !== null && message !== undefined && message !== '' ? (
                                message
                            ) : (
                                'Your payment could not be completed. Please try again or choose another method.'
                            )}
                        </ModalDescription>
                        <div className="mt-2 grid w-full grid-cols-2 gap-3">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="button" variant="champagne" onClick={onRetry}>
                                Retry
                            </Button>
                        </div>
                    </div>
                ) : null}
            </ModalContent>
        </Modal>
    );
}