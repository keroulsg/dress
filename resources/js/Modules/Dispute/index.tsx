/**
 * Dispute module — public surface.
 */

import { AlertTriangle } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';
import { Badge } from '../../Components/UI/Badge';
import type { DisputeStatus } from '../../types/models';

export type { DisputeStatus };

const disputeTone: Record<DisputeStatus, 'warning' | 'danger' | 'info' | 'success' | 'neutral'> = {
    open: 'warning',
    under_review: 'info',
    awaiting_customer: 'info',
    awaiting_atelier: 'info',
    resolved: 'success',
    rejected: 'danger',
};

export interface DisputeThreadMessage {
    id: number;
    author: string;
    body: string;
    createdAt: string;
    isCustomer: boolean;
}

export interface DisputeThreadViewProps {
    status: DisputeStatus;
    messages: DisputeThreadMessage[];
}

/** Dispute conversation thread with status context. */
export function DisputeThreadView({ status, messages }: DisputeThreadViewProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                <Badge tone={disputeTone[status]}>{status.replaceAll('_', ' ')}</Badge>
            </div>

            <ol className="space-y-3" aria-label="Dispute messages">
                {messages.map((message) => (
                    <li key={message.id} className={cn('flex', message.isCustomer ? 'justify-end' : 'justify-start')}>
                        <div
                            className={cn(
                                'max-w-[80%] border px-4 py-3',
                                message.isCustomer ? 'border-champagne/40 bg-champagne/10' : 'border-stone-line bg-white',
                            )}
                        >
                            <p className="text-xs text-stone-muted">
                                {message.author} · {message.createdAt}
                            </p>
                            <p className="mt-1 text-sm text-charcoal">{message.body}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}