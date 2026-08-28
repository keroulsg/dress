import * as React from 'react';

import { cn } from '../../Lib/utils';

export type BadgeTone = 'neutral' | 'champagne' | 'rose' | 'success' | 'warning' | 'danger' | 'info';

const toneClasses: Record<BadgeTone, string> = {
    neutral: 'bg-stone-line/60 text-stone-muted',
    champagne: 'bg-champagne/15 text-rose-deep',
    rose: 'bg-rose/10 text-rose',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    tone?: BadgeTone;
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide',
                toneClasses[tone],
                className,
            )}
            {...props}
        />
    );
}