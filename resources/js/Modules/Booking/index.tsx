/**
 * Booking module — public surface.
 */

import { CheckCircle2, Circle, Package, RotateCcw, ShieldCheck, Truck, UserRound } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';
import type { BookingSnapshot } from '../../types/contracts';
import { bookingStatus } from '../../Lib/tokens';

export type { BookingSnapshot };

const TIMELINE_STEPS = [
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'fitting_scheduled', label: 'Fitting', icon: UserRound },
    { key: 'ready_for_dispatch', label: 'Ready', icon: ShieldCheck },
    { key: 'dispatched', label: 'Dispatched', icon: Truck },
    { key: 'returned_pending_inspection', label: 'Returned', icon: RotateCcw },
    { key: 'completed', label: 'Completed', icon: Package },
] as const;

export interface BookingTimelineProps {
    booking: Pick<BookingSnapshot, 'status'>;
}

/** Vertical booking timeline: Booked → … → Completed. */
export function BookingTimeline({ booking }: BookingTimelineProps) {
    const status = booking.status;
    const currentIndex = TIMELINE_STEPS.findIndex((step) => step.key === status);

    const isPast = (index: number): boolean => {
        if (currentIndex === -1) {
            return false;
        }

        return index <= currentIndex;
    };

    return (
        <ol className="space-y-1" aria-label="Booking progress">
            {TIMELINE_STEPS.map((step, index) => {
                const Icon = step.icon;
                const done = isPast(index);

                return (
                    <li key={step.key} className="flex items-center gap-3">
                        <span
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
                                done ? 'border-champagne bg-champagne/15 text-rose-deep' : 'border-stone-line text-stone-muted',
                            )}
                        >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className={cn('text-sm', done ? 'font-medium text-charcoal' : 'text-stone-muted')}>
                            {step.label}
                        </span>
                        {index === currentIndex ? <span className="text-xs text-rose-deep">— current</span> : null}
                    </li>
                );
            })}
            {status === 'cancelled' ? (
                <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-danger/30 bg-danger/10 text-danger">
                        <Circle className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-danger">Cancelled</span>
                </li>
            ) : null}
            {status === 'disputed' ? (
                <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-danger/30 bg-danger/10 text-danger">
                        <Circle className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-danger">Disputed</span>
                </li>
            ) : null}
        </ol>
    );
}

export { bookingStatus };