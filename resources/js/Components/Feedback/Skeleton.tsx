import * as React from 'react';

import { cn } from '../../Lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Skeleton loader — shimmer placeholder during async data load. */
export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn('animate-pulse rounded-none bg-stone-line/70', className)}
            {...props}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="space-y-3 border border-stone-line bg-white p-6">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}