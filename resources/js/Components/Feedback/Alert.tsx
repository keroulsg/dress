import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';

export type AlertTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const toneStyles: Record<AlertTone, { container: string; icon: React.ReactNode }> = {
    success: {
        container: 'border-success/30 bg-success/5 text-charcoal',
        icon: <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />,
    },
    warning: {
        container: 'border-warning/30 bg-warning/5 text-charcoal',
        icon: <TriangleAlert className="h-4 w-4 text-warning" aria-hidden="true" />,
    },
    danger: {
        container: 'border-danger/30 bg-danger/5 text-charcoal',
        icon: <XCircle className="h-4 w-4 text-danger" aria-hidden="true" />,
    },
    info: {
        container: 'border-info/30 bg-info/5 text-charcoal',
        icon: <Info className="h-4 w-4 text-info" aria-hidden="true" />,
    },
    neutral: {
        container: 'border-stone-line bg-ivory text-charcoal',
        icon: <Info className="h-4 w-4 text-stone-muted" aria-hidden="true" />,
    },
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    tone?: AlertTone;
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
}

export function Alert({ className, tone = 'neutral', title, dismissible, onDismiss, children, ...props }: AlertProps) {
    const styles = toneStyles[tone];

    return (
        <div
            role={tone === 'danger' ? 'alert' : 'status'}
            className={cn('flex gap-3 border px-4 py-3 text-sm', styles.container, className)}
            {...props}
        >
            <span className="mt-0.5 shrink-0">{styles.icon}</span>
            <div className="flex-1 space-y-1">
                {title ? <p className="font-semibold text-charcoal">{title}</p> : null}
                {children ? <div className="text-stone-muted">{children}</div> : null}
            </div>
            {dismissible && onDismiss ? (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss alert"
                    className="shrink-0 rounded-none p-0.5 text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            ) : null}
        </div>
    );
}