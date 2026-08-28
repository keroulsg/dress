/**
 * Timezone-aware date helpers.
 *
 * Rental dates are calendar dates in the application timezone (Africa/Cairo);
 * timestamps are stored in UTC. This module centralizes formatting so timezone
 * bugs cannot be introduced ad hoc.
 */

import { format, parseISO } from 'date-fns';

export const APP_TIMEZONE = 'Africa/Cairo';

/** Rental calendar dates render date-only, never timezone-shifted. */
export function formatCalendarDate(value: string | Date): string {
    const date = typeof value === 'string' ? parseISO(value) : value;

    return format(date, 'EEE, MMM d, yyyy');
}

export function formatCalendarDateShort(value: string | Date): string {
    const date = typeof value === 'string' ? parseISO(value) : value;

    return format(date, 'MMM d, yyyy');
}

/** Inclusive rental range, e.g. "Sep 1 – Sep 3, 2026". */
export function formatDateRange(start: string | Date, end: string | Date): string {
    const startDate = typeof start === 'string' ? parseISO(start) : start;
    const endDate = typeof end === 'string' ? parseISO(end) : end;

    const sameYear = startDate.getFullYear() === endDate.getFullYear();

    if (sameYear) {
        return `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`;
    }

    return `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`;
}

/** Inclusive calendar-day count between two dates (min 1). */
export function rentalDayCount(start: string | Date, end: string | Date): number {
    const startDate = typeof start === 'string' ? parseISO(start) : start;
    const endDate = typeof end === 'string' ? parseISO(end) : end;
    const ms = endDate.getTime() - startDate.getTime();

    return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

/** Timestamps (UTC storage) formatted for the application timezone. */
export function formatTimestamp(iso: string, pattern = 'MMM d, yyyy h:mm a'): string {
    try {
        const date = parseISO(iso);

        // date-fns v4 is timezone-agnostic; apply the app offset explicitly.
        const appOffsetMs = appTimezoneOffsetMs(iso);

        return format(new Date(date.getTime() + appOffsetMs), pattern);
    } catch {
        return '—';
    }
}

/** Current UTC offset (in ms) for the configured application timezone. */
export function appTimezoneOffsetMs(iso: string | Date = new Date()): number {
    try {
        const date = typeof iso === 'string' ? new Date(iso) : iso;

        return Intl.DateTimeFormat('en-US', {
            timeZone: APP_TIMEZONE,
            timeZoneName: 'longOffset',
        })
            .formatToParts(date)
            .filter((part) => part.type === 'timeZoneName')
            .map((part) => parseOffset(part.value))
            .reduce((sum, value) => sum + value, 0);
    } catch {
        return 0;
    }
}

function parseOffset(name: string): number {
    const match = name.match(/GMT([+-])(\d{2}):?(\d{2})?/);

    if (!match) {
        return 0;
    }

    const sign = match[1] === '+' ? 1 : -1;
    const hours = Number(match[2]);
    const minutes = match[3] ? Number(match[3]) : 0;

    return sign * (hours * 3_600_000 + minutes * 60_000);
}