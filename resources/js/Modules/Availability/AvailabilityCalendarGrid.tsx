import axios from 'axios';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { formatCalendarDateShort, rentalDayCount } from '../../Lib/dates';
import { cn } from '../../Lib/utils';

export interface AvailabilityDay {
    status: 'available' | 'booked' | 'buffer' | 'maintenance' | 'manual_block' | 'unavailable';
    type?: string;
}

export interface AvailabilityCalendarGridProps {
    dressId: number;
    month: { year: number; month: number };
    bufferDays: number;
    days: Record<string, AvailabilityDay>;
    minDate?: string;
    selectedStart?: string | null;
    selectedEnd?: string | null;
    onSelectRange?: (start: string | null, end: string | null) => void;
    onMonthChange?: (year: number, month: number) => void;
    maxRentalDays?: number;
}

export interface AvailabilityMonth {
    dress_id: number;
    month: string;
    buffer_days: number;
    days: Record<string, AvailabilityDay>;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const DAY_TOOLTIPS: Record<AvailabilityDay['status'], string> = {
    available: 'Available',
    booked: 'Booked',
    buffer: 'Cleaning & Quality Check',
    maintenance: 'Under maintenance',
    manual_block: 'Dates blocked',
    unavailable: 'Unavailable',
};

const STATUS_CLASSES: Record<AvailabilityDay['status'], string> = {
    available: 'text-charcoal hover:bg-champagne/20 hover:text-rose-deep',
    booked: 'cursor-not-allowed bg-stone-line/70 text-stone-muted line-through',
    buffer: 'cursor-not-allowed text-stone-muted',
    maintenance: 'cursor-not-allowed bg-rose/10 text-rose-deep',
    manual_block: 'cursor-not-allowed bg-rose/10 text-rose-deep',
    unavailable: 'cursor-not-allowed bg-stone-line/40 text-stone-muted',
};

const BUFFER_STRIPES = 'repeating-linear-gradient(45deg, #fcd34d22 0 8px, transparent 8px 16px)';

const MONTH_KEY = (year: number, month: number): string =>
    `${year}-${String(month).padStart(2, '0')}`;

const DAY_KEY = (year: number, month: number, day: number): string =>
    `${MONTH_KEY(year, month)}-${String(day).padStart(2, '0')}`;

function pluralize(count: number, singular: string): string {
    return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

export function useMonthAvailability(dressId: number, year: number, month: number): {
    data: AvailabilityMonth | null;
    loading: boolean;
    error: string | null;
} {
    const [data, setData] = React.useState<AvailabilityMonth | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setError(null);

        axios
            .get<AvailabilityMonth>(`/api/dresses/${dressId}/availability-calendar`, {
                params: { year, month },
                signal: controller.signal,
            })
            .then((response) => setData(response.data))
            .catch((err: unknown) => {
                if (axios.isCancel(err)) {
                    return;
                }

                setError(err instanceof Error ? err.message : 'Unable to load availability for this month.');
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [dressId, year, month]);

    return { data, loading, error };
}

export function AvailabilityCalendarGrid({
    dressId,
    month,
    bufferDays,
    days,
    minDate,
    selectedStart = null,
    selectedEnd = null,
    onSelectRange,
    onMonthChange,
    maxRentalDays = 14,
}: AvailabilityCalendarGridProps) {
    const { year, month: monthNumber } = month;
    const monthIndex = monthNumber - 1;
    const monthKey = MONTH_KEY(year, monthNumber);
    const minDateMonthKey = minDate ? minDate.slice(0, 7) : null;
    const prevDisabled = minDateMonthKey !== null && monthKey <= minDateMonthKey;

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const leadingBlanks = new Date(year, monthIndex, 1).getDay();

    const goPrevious = (): void => {
        const prev =
            monthNumber === 1 ? { year: year - 1, month: 12 } : { year, month: monthNumber - 1 };

        onMonthChange?.(prev.year, prev.month);
    };

    const goNext = (): void => {
        const next =
            monthNumber === 12 ? { year: year + 1, month: 1 } : { year, month: monthNumber + 1 };

        onMonthChange?.(next.year, next.month);
    };

    const handleDayClick = (dayKey: string, status: AvailabilityDay['status']): void => {
        if (status !== 'available') {
            return;
        }

        if (minDate && dayKey < minDate) {
            return;
        }

        if (selectedStart === null) {
            onSelectRange?.(dayKey, null);

            return;
        }

        if (dayKey === selectedStart) {
            onSelectRange?.(null, null);

            return;
        }

        if (selectedEnd !== null) {
            onSelectRange?.(dayKey, null);

            return;
        }

        const start = dayKey < selectedStart ? dayKey : selectedStart;
        const end = dayKey < selectedStart ? selectedStart : dayKey;

        if (rentalDayCount(start, end) > maxRentalDays) {
            return;
        }

        onSelectRange?.(start, end);
    };

    return (
        <div className="w-full">
            <div className="mb-4 flex items-center justify-between">
                <button
                    type="button"
                    onClick={goPrevious}
                    disabled={prevDisabled}
                    aria-label="Previous month"
                    className="rounded-none p-1 text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <p className="font-display text-lg text-charcoal" aria-live="polite">
                    {format(new Date(year, monthIndex, 1), 'MMMM yyyy')}
                </p>
                <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next month"
                    className="rounded-none p-1 text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1" aria-label={`Availability calendar for dress ${dressId}`}>
                {WEEKDAY_LABELS.map((label) => (
                    <div
                        key={label}
                        className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-stone-muted"
                    >
                        {label}
                    </div>
                ))}

                {Array.from({ length: leadingBlanks }).map((_, index) => (
                    <div key={`blank-${index}`} aria-hidden="true" />
                ))}

                {Array.from({ length: daysInMonth }, (_, dayNumber) => dayNumber + 1).map((day) => {
                    const dayKey = DAY_KEY(year, monthNumber, day);
                    const dayInfo = days[dayKey] ?? { status: 'available' as const };
                    const status = dayInfo.status;
                    const tooltip = DAY_TOOLTIPS[status];
                    const isPast = minDate !== undefined && dayKey < minDate;
                    const isStart = selectedStart === dayKey;
                    const isEnd = selectedEnd === dayKey;
                    const isInRange =
                        selectedStart !== null &&
                        selectedEnd !== null &&
                        dayKey > selectedStart &&
                        dayKey < selectedEnd;
                    const isSelected = isStart || isEnd;
                    const isDisabled = status !== 'available' || isPast;

                    return (
                        <button
                            key={dayKey}
                            type="button"
                            onClick={() => handleDayClick(dayKey, status)}
                            disabled={isDisabled}
                            aria-label={`${formatCalendarDateShort(dayKey)} — ${tooltip}`}
                            aria-pressed={isSelected}
                            title={tooltip}
                            className={cn(
                                'relative flex h-11 w-full flex-col items-center justify-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                isSelected
                                    ? 'bg-charcoal font-semibold text-white'
                                    : isInRange
                                      ? 'bg-champagne/30 text-charcoal'
                                      : STATUS_CLASSES[status],
                                isPast && 'cursor-not-allowed text-stone-muted/40',
                            )}
                            style={status === 'buffer' && !isSelected ? { backgroundImage: BUFFER_STRIPES } : undefined}
                        >
                            {day}
                            {status === 'available' && !isSelected && !isInRange ? (
                                <span
                                    className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-success"
                                    aria-hidden="true"
                                />
                            ) : null}
                        </button>
                    );
                })}
            </div>

            {selectedStart !== null && selectedEnd !== null ? (
                <div className="mt-4 space-y-0.5 border-t border-stone-line pt-3" aria-live="polite">
                    <p className="font-display text-lg text-charcoal">
                        {pluralize(rentalDayCount(selectedStart, selectedEnd), 'rental day')}
                    </p>
                    {bufferDays > 0 ? (
                        <p className="text-xs text-stone-muted">
                            Includes {pluralize(bufferDays, 'buffer day')} for cleaning & inspection
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}