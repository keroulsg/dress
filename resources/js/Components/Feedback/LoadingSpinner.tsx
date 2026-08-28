import { cn } from '../../Lib/utils';

export function LoadingSpinner({ className, label = 'Loading…' }: { className?: string; label?: string }) {
    return (
        <div role="status" aria-live="polite" className={cn('flex items-center gap-3 text-sm text-stone-muted', className)}>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-champagne/30 border-t-rose" aria-hidden="true" />
            {label}
        </div>
    );
}