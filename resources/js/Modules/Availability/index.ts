/**
 * Availability module — public surface.
 */

import type { CalendarDateStatus, CalendarDayState } from '../../Components/UI/Calendar';

export type { CalendarDateStatus, CalendarDayState };

export { Calendar } from '../../Components/UI/Calendar';

/**
 * Builds a month's availability status list from a set of blocked date ranges.
 * Each blocked date maps to the given state; unblocked dates are available.
 */
export function buildAvailabilityStatuses(
    month: Date,
    blockedRanges: Array<{ start: string; end: string }>,
    state: CalendarDayState = 'booked',
): CalendarDateStatus[] {
    const statuses: CalendarDateStatus[] = [];
    const blocked = new Set<string>();

    for (const range of blockedRanges) {
        let cursor = new Date(`${range.start}T00:00:00`);

        while (cursor.toISOString().slice(0, 10) <= range.end) {
            blocked.add(cursor.toISOString().slice(0, 10));
            cursor.setDate(cursor.getDate() + 1);
        }
    }

    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day += 1) {
        const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        statuses.push({ date: key, state: blocked.has(key) ? state : 'available' });
    }

    return statuses;
}