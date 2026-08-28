import { PackageOpen } from 'lucide-react';
import * as React from 'react';

import { Button } from '../UI/Button';

export interface EmptyStateProps {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

/** Editorial empty state — no placeholder art, clear next action. */
export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-stone-line bg-ivory/50 px-6 py-16 text-center">
            <PackageOpen className="h-8 w-8 text-champagne" aria-hidden="true" />
            <p className="font-display text-xl text-charcoal">{title}</p>
            {description ? <p className="max-w-sm text-sm text-stone-muted">{description}</p> : null}
            {actionLabel && onAction ? (
                <Button type="button" variant="champagne" size="sm" onClick={onAction}>
                    {actionLabel}
                </Button>
            ) : null}
        </div>
    );
}