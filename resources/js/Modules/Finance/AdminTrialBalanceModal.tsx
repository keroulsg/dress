/**
 * Admin trial balance modal — real-time general ledger health check.
 */

import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

import { Button } from '../../Components/UI/Button';
import { Modal, ModalContent, ModalTitle } from '../../Components/UI/Modal';
import { formatCurrency } from '../../Lib/currency';
import { cn } from '../../Lib/utils';

export interface AdminTrialBalanceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    balanced: boolean;
    totalDebits?: string;
    totalCredits?: string;
    onRunCheck?: () => void;
}

const TRIAL_BALANCE_TITLE_ID = 'trial-balance-title';

export function AdminTrialBalanceModal({
    open,
    onOpenChange,
    balanced,
    totalDebits,
    totalCredits,
    onRunCheck,
}: AdminTrialBalanceModalProps) {
    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent aria-labelledby={TRIAL_BALANCE_TITLE_ID} aria-live="assertive" className="max-w-md">
                <ModalTitle id={TRIAL_BALANCE_TITLE_ID} className="sr-only">
                    Trial balance check
                </ModalTitle>

                <div
                    className={cn(
                        'flex items-center justify-center gap-3 border px-6 py-6',
                        balanced
                            ? 'border-success/30 bg-success/10 text-success'
                            : 'border-rose/25 bg-rose/10 text-rose',
                    )}
                >
                    {balanced ? (
                        <CheckCircle2 className="h-8 w-8 shrink-0" aria-hidden="true" />
                    ) : (
                        <XCircle className="h-8 w-8 shrink-0" aria-hidden="true" />
                    )}
                    <p className="font-display text-2xl font-semibold">
                        {balanced ? 'Ledger Balanced' : 'Imbalance Detected'}
                    </p>
                </div>

                <p className="mt-4 text-center text-sm text-stone-muted">
                    {balanced
                        ? 'Total debits equal total credits across the general ledger.'
                        : 'The ledger is out of balance. Review the entries below before closing the books.'}
                </p>

                <div className="mt-5 space-y-3 border border-stone-line bg-ivory/60 p-5">
                    <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-stone-muted">Total debits</span>
                        <span className="font-mono text-sm font-medium text-charcoal">
                            {totalDebits ? formatCurrency(totalDebits, 'EGP') : '—'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-stone-line pt-3 text-sm">
                        <span className="text-stone-muted">Total credits</span>
                        <span className="font-mono text-sm font-medium text-charcoal">
                            {totalCredits ? formatCurrency(totalCredits, 'EGP') : '—'}
                        </span>
                    </div>
                </div>

                <div className="mt-6">
                    <Button type="button" variant="primary" className="w-full" onClick={onRunCheck} disabled={!onRunCheck}>
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Re-run check
                    </Button>
                </div>
            </ModalContent>
        </Modal>
    );
}