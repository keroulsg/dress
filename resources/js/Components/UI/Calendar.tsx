import { addDays, addMonths, eachDayOfInterval, endOfMonth, format, isBefore, isSameDay, isSameMonth, startOfMonth, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';

export type CalendarDayState = 'available' | 'booked' | 'buffer' | 'maintenance' | 'unavailable';

export interface CalendarDateStatus {
    date: string; // yyyy-MM-dd
    state: CalendarDayState;
}

export interface CalendarProps {
    month?: Date;
    selectedStart?: Date | null;
    selectedEnd?: Date | null;
    statuses?: CalendarDateStatus[];
    disabled?: boolean;
    minDate?: Date;
    onSelectStart?: (date: Date) => void;
    onSelectEnd?: (date: Date | null) => void;
}

const stateClassNames: Record<CalendarDayState, string> = {
    available: 'text-charcoal hover:bg-champagne/20 hover:text-rose-deep',
    booked: 'cursor-not-allowed bg-stone-line text-stone-muted line-through',
    buffer: 'cursor-not-allowed bg-champagne/30 text-stone-muted',
    maintenance: 'cursor-not-allowed bg-danger/10 text-danger',
    unavailable: 'cursor-not-allowed bg-stone-line/40 text-stone-muted',
};

export function Calendar({
    month = new Date(),
    selectedStart,
    selectedEnd,
    statuses = [],
    disabled = false,
    minDate,
    onSelectStart,
    onSelectEnd,
}: CalendarProps) {
    const [visibleMonth, setVisibleMonth] = React.useState(startOfMonth(month));

    const statusMap = React.useMemo(() => {
        const map = new Map<string, CalendarDayState>();

        for (const status of statuses) {
            map.set(status.date, status.state);
        }

        return map;
    }, [statuses]);

    const days = React.useMemo(
        () => eachDayOfInterval({ start: visibleMonth, end: endOfMonth(visibleMonth) }),
        [visibleMonth],
    );

    const leadingBlanks = visibleMonth.getDay();

    const inSelectedRange = (date: Date): boolean => {
        if (!selectedStart || !selectedEnd) {
            return false;
        }

        return !isBefore(date, selectedStart) && !isBefore(selectedEnd, date);
    };

    const handleDayClick = (date: Date): void => {
        if (disabled) {
            return;
        }

        const state = statusMap.get(format(date, 'yyyy-MM-dd')) ?? 'available';

        if (state !== 'available' && state !== 'buffer') {
            return;
        }

        if (minDate && isBefore(date, minDate)) {
            return;
        }

        if (!selectedStart || (selectedStart && selectedEnd)) {
            onSelectStart?.(date);
            onSelectEnd?.(null);

            return;
        }

        if (isBefore(date, selectedStart)) {
            onSelectStart?.(date);

            return;
        }

        onSelectEnd?.(date);
    };

    return (
        <div className="w-full">
            <div className="mb-4 flex items-center justify-between">
                <button
                    type="button"
                    aria-label="Previous month"
                    className="rounded-none p-1 text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                    onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
                >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <p className="font-display text-lg text-charcoal" aria-live="polite">
                    {format(visibleMonth, 'MMMM yyyy')}
                </p>
                <button
                    type="button"
                    aria-label="Next month"
                    className="rounded-none p-1 text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                    onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
                >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label="Availability calendar">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((label) => (
                    <span key={label} className="py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-muted">
                        {label}
                    </span>
                ))}

                {Array.from({ length: leadingBlanks }).map((_, index) => (
                    <span key={`blank-${index}`} aria-hidden="true" />
                ))}

                {days.map((date) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const state = statusMap.get(dateKey) ?? 'available';
                    const isStart = selectedStart != null && isSameDay(date, selectedStart);
                    const isEnd = selectedEnd != null && isSameDay(date, selectedEnd);
                    const isInRange = inSelectedRange(date);
                    const isPast = minDate != null && isBefore(date, minDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <button
                            key={dateKey}
                            type="button"
                            onClick={() => handleDayClick(date)}
                            disabled={disabled || isPast}
                            aria-label={`${format(date, 'MMMM d, yyyy')} ${state}`}
                            aria-pressed={isStart || isEnd}
                            className={cn(
                                'flex h-9 w-full items-center justify-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                isSameMonth(date, visibleMonth) ? '' : 'opacity-40',
                                isStart || isEnd
                                    ? 'bg-charcoal font-semibold text-white'
                                    : isInRange
                                      ? 'bg-champagne/30 text-charcoal'
                                      : stateClassNames[state],
                                isToday && !isStart && !isEnd && 'ring-1 ring-inset ring-champagne',
                            )}
                        >
                            {format(date, 'd')}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-muted" aria-hidden="true">
                <LegendDot className="bg-champagne/30" label="Selected" />
                <LegendDot className="bg-stone-line" label="Booked" />
                <LegendDot className="bg-champagne" label="Buffer" />
                <LegendDot className="bg-danger/20" label="Unavailable" />
            </div>
        </div>
    );
}

function LegendDot({ className, label }: { className: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className={cn('inline-block h-2.5 w-2.5', className)} />
            {label}
        </span>
    );
}

export { addDays };