/**
 * Booking timeline — vertical stepper from reservation to completion.
 */

import { CalendarClock, Check, CircleX, Clock } from 'lucide-react';

import { Button } from '../../Components/UI/Button';
import { formatDateRange, formatTimestamp } from '../../Lib/dates';
import { bookingStatus } from '../../Lib/tokens';
import { cn } from '../../Lib/utils';

export interface BookingTimelineAction {
    label: string;
    onClick: () => void;
    tone?: 'primary' | 'outline' | 'danger';
}

export interface BookingTimelineProps {
    status: string;
    fittingDatetime?: string | null;
    startDate: string;
    endDate: string;
    actions?: BookingTimelineAction[];
}

const PHASES = [
    'Booked',
    'Payment',
    'Fitting (Optional)',
    'Preparation',
    'Dispatched',
    'In Possession',
    'Returned',
    'Inspection',
    'Completed',
] as const;

const STATUS_PHASE_INDEX: Record<string, number> = {
    pending_payment: 0,
    confirmed: 1,
    fitting_scheduled: 2,
    ready_for_dispatch: 3,
    dispatched: 4,
    in_customer_possession: 5,
    returned_pending_inspection: 6,
    inspection_completed: 7,
    completed: 8,
};

const TERMINAL_STATUSES = new Set(['cancelled', 'expired', 'disputed']);

const ACTION_VARIANTS: Record<NonNullable<BookingTimelineAction['tone']>, 'primary' | 'outline' | 'danger'> = {
    primary: 'primary',
    outline: 'outline',
    danger: 'danger',
};

export function BookingTimeline({
    status,
    fittingDatetime = null,
    startDate,
    endDate,
    actions = [],
}: BookingTimelineProps) {
    const currentIndex = STATUS_PHASE_INDEX[status] ?? -1;
    const isTerminal = TERMINAL_STATUSES.has(status);

    return (
        <div aria-label="Booking progress">
            <p className="text-xs uppercase tracking-luxe text-stone-muted">Rental dates</p>
            <p className="mt-1 font-display text-lg text-charcoal">{formatDateRange(startDate, endDate)}</p>

            <ol className="mt-5 space-y-0">
                {PHASES.map((label, index) => {
                    const done = currentIndex !== -1 && index < currentIndex;
                    const current = index === currentIndex;
                    const last = index === PHASES.length - 1;
                    const showFitting = label === 'Fitting (Optional)' && fittingDatetime !== null;

                    return (
                        <li key={label} className="relative flex gap-3 pb-6 last:pb-0">
                            {!last ? (
                                <span
                                    className={cn(
                                        'absolute left-[15px] top-8 h-full w-px',
                                        done ? 'bg-champagne' : 'bg-stone-line',
                                    )}
                                    aria-hidden="true"
                                />
                            ) : null}
                            <span
                                className={cn(
                                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors',
                                    done
                                        ? 'border-champagne bg-champagne/15 text-rose-deep'
                                        : current
                                          ? 'border-rose text-rose ring-2 ring-rose/25'
                                          : 'border-stone-line bg-white text-stone-muted',
                                )}
                            >
                                {done ? (
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
                                )}
                            </span>
                            <div className="pt-1.5">
                                <p
                                    className={cn(
                                        'text-sm',
                                        done || current ? 'font-medium text-charcoal' : 'text-stone-muted',
                                    )}
                                >
                                    {label}
                                </p>
                                {showFitting ? (
                                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-muted">
                                        <CalendarClock className="h-3.5 w-3.5 text-champagne" aria-hidden="true" />
                                        {formatTimestamp(fittingDatetime)}
                                    </p>
                                ) : null}
                                {current ? (
                                    <p className="mt-0.5 text-xs uppercase tracking-luxe text-rose">Current</p>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ol>

            {isTerminal ? (
                <div className="mt-5 flex items-center gap-3 border-t border-stone-line pt-5">
                    <span
                        className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                            status === 'expired'
                                ? 'border-stone-line bg-white text-stone-muted'
                                : 'border-danger/30 bg-danger/10 text-danger',
                        )}
                    >
                        {status === 'expired' ? (
                            <Clock className="h-4 w-4" aria-hidden="true" />
                        ) : (
                            <CircleX className="h-4 w-4" aria-hidden="true" />
                        )}
                    </span>
                    <div>
                        <p
                            className={cn(
                                'text-sm font-medium',
                                status === 'expired' ? 'text-stone-muted' : 'text-danger',
                            )}
                        >
                            {bookingStatus[status]?.label ?? status}
                        </p>
                        <p className="text-xs text-stone-muted">
                            {status === 'expired'
                                ? 'This booking expired before completion.'
                                : 'This booking was closed before the rental was completed.'}
                        </p>
                    </div>
                </div>
            ) : null}

            {actions.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                    {actions.map((action) => (
                        <Button
                            key={action.label}
                            type="button"
                            variant={ACTION_VARIANTS[action.tone ?? 'primary']}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}