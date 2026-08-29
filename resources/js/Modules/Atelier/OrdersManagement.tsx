/**
 * Orders management — atelier booking kanban.
 */

import { useForm } from '@inertiajs/react';
import * as React from 'react';

import { EmptyState } from '../../Components/Feedback/EmptyState';
import { useToast } from '../../Components/Feedback/Toast';
import { Badge } from '../../Components/UI/Badge';
import { Button } from '../../Components/UI/Button';
import { Modal, ModalContent, ModalTitle } from '../../Components/UI/Modal';
import { Select } from '../../Components/UI/Select';
import { Textarea } from '../../Components/UI/Textarea';
import { formatCurrency } from '../../Lib/currency';
import { formatDateRange } from '../../Lib/dates';
import { bookingStatus, statusColors } from '../../Lib/tokens';

export interface OrdersManagementBooking {
    id: number;
    booking_reference: string;
    status: string;
    start_date: string;
    end_date: string;
    grand_total: string;
    currency: string;
    renter: { name: string; phone: string | null };
    dress_title: string | null;
}

export interface OrdersManagementProps {
    atelierId: number;
    bookings: OrdersManagementBooking[];
    statuses: string[];
}

const OPERATIONAL_STATES = [
    'ready_for_dispatch',
    'dispatched',
    'in_customer_possession',
    'returned_pending_inspection',
] as const;

const NEXT_STATES: Record<string, string> = {
    ready_for_dispatch: 'dispatched',
    dispatched: 'in_customer_possession',
    in_customer_possession: 'returned_pending_inspection',
    returned_pending_inspection: 'inspection_completed',
};

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="mb-1.5 block text-xs uppercase tracking-luxe text-stone-muted">
            {children}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    return message ? <p className="mt-1.5 text-xs text-danger">{message}</p> : null;
}

function statusMeta(status: string): { color: string; label: string } {
    return bookingStatus[status] ?? { color: statusColors.stone, label: status || 'Unknown' };
}

function BookingCard({
    booking,
    canAdvance,
    onAdvance,
}: {
    booking: OrdersManagementBooking;
    canAdvance: boolean;
    onAdvance: () => void;
}) {
    const meta = statusMeta(booking.status);

    return (
        <div className="border border-stone-line bg-white p-4 shadow-subtle">
            <div className="flex items-start justify-between gap-2">
                <p className="font-display text-base text-charcoal">{booking.dress_title ?? 'Untitled dress'}</p>
                <Badge style={{ color: meta.color, backgroundColor: `${meta.color}18` }}>{meta.label}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-stone-muted">#{booking.booking_reference}</p>
            <div className="mt-3 space-y-1">
                <p className="text-sm text-charcoal">{booking.renter.name}</p>
                {booking.renter.phone ? <p className="text-xs text-stone-muted">{booking.renter.phone}</p> : null}
                <p className="text-xs text-stone-muted">{formatDateRange(booking.start_date, booking.end_date)}</p>
                <p className="text-sm font-medium tabular-nums text-charcoal">
                    {formatCurrency(booking.grand_total, booking.currency)}
                </p>
            </div>
            {canAdvance ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={onAdvance}
                    aria-label={`Advance booking ${booking.booking_reference}`}
                >
                    Advance
                </Button>
            ) : null}
        </div>
    );
}

export function OrdersManagement({ atelierId, bookings, statuses }: OrdersManagementProps) {
    const { toast } = useToast();
    const [activeBooking, setActiveBooking] = React.useState<OrdersManagementBooking | null>(null);
    const transitionForm = useForm<{ target_status: string; reason: string }>({
        target_status: '',
        reason: '',
    });

    const otherStatuses = statuses.filter((status) => !(status in NEXT_STATES));

    const openTransition = (booking: OrdersManagementBooking): void => {
        const target = NEXT_STATES[booking.status];
        if (!target) {
            return;
        }
        transitionForm.reset();
        transitionForm.setData('target_status', target);
        setActiveBooking(booking);
    };

    const submitTransition = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (!activeBooking) {
            return;
        }
        transitionForm.post(`/atelier/${atelierId}/bookings/${activeBooking.id}/transition`, {
            onSuccess: () => {
                toast('Booking advanced', {
                    tone: 'success',
                    description: `${activeBooking.booking_reference} moved to the next stage.`,
                });
                setActiveBooking(null);
                transitionForm.reset();
            },
        });
    };

    if (bookings.length === 0) {
        return (
            <EmptyState
                title="No bookings yet"
                description="Rental bookings will appear here once customers place their orders."
            />
        );
    }

    const otherCount = bookings.filter((booking) => !(booking.status in NEXT_STATES)).length;

    return (
        <div>
            <div className="flex gap-4 overflow-x-auto pb-4">
                {OPERATIONAL_STATES.map((status) => {
                    const items = bookings.filter((booking) => booking.status === status);
                    const meta = statusMeta(status);

                    return (
                        <div key={status} className="w-72 shrink-0">
                            <header className="flex items-center justify-between gap-2 border-b border-stone-line pb-2">
                                <p className="text-xs uppercase tracking-luxe text-stone-muted">{meta.label}</p>
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-line/60 px-1.5 text-xs font-medium text-charcoal">
                                    {items.length}
                                </span>
                            </header>
                            <div className="mt-3 space-y-3">
                                {items.map((booking) => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        canAdvance
                                        onAdvance={() => openTransition(booking)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                <div className="w-72 shrink-0">
                    <header className="flex items-center justify-between gap-2 border-b border-stone-line pb-2">
                        <p className="text-xs uppercase tracking-luxe text-stone-muted">Other</p>
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-line/60 px-1.5 text-xs font-medium text-charcoal">
                            {otherCount}
                        </span>
                    </header>
                    <div className="mt-3 space-y-4">
                        {otherStatuses.map((status) => {
                            const items = bookings.filter((booking) => booking.status === status);
                            if (items.length === 0) {
                                return null;
                            }
                            const meta = statusMeta(status);

                            return (
                                <div key={status} className="space-y-3">
                                    <p className="text-xs" style={{ color: meta.color }}>
                                        {meta.label} · {items.length}
                                    </p>
                                    {items.map((booking) => (
                                        <BookingCard
                                            key={booking.id}
                                            booking={booking}
                                            canAdvance={false}
                                            onAdvance={() => undefined}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {activeBooking ? (
                <Modal open onOpenChange={(open) => { if (!open) setActiveBooking(null); }}>
                    <ModalContent className="max-w-md">
                        <ModalTitle className="font-display text-2xl text-charcoal">Advance booking</ModalTitle>
                        <p className="mt-1 text-sm text-stone-muted">
                            {activeBooking.dress_title ?? 'Booking'} · #{activeBooking.booking_reference}
                        </p>

                        <form onSubmit={submitTransition} className="mt-5 space-y-4">
                            <div>
                                <FieldLabel htmlFor="transition-target">Next stage</FieldLabel>
                                <Select
                                    id="transition-target"
                                    value={transitionForm.data.target_status}
                                    onChange={(event) => transitionForm.setData('target_status', event.target.value)}
                                >
                                    <option value="">Select a stage</option>
                                    {NEXT_STATES[activeBooking.status] ? (
                                        <option value={NEXT_STATES[activeBooking.status]}>
                                            {statusMeta(NEXT_STATES[activeBooking.status]).label}
                                        </option>
                                    ) : null}
                                </Select>
                                <FieldError message={transitionForm.errors.target_status} />
                            </div>
                            <div>
                                <FieldLabel htmlFor="transition-reason">Reason (optional)</FieldLabel>
                                <Textarea
                                    id="transition-reason"
                                    value={transitionForm.data.reason}
                                    onChange={(event) => transitionForm.setData('reason', event.target.value)}
                                    placeholder="Optional note for this stage change"
                                />
                                <FieldError message={transitionForm.errors.reason} />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setActiveBooking(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={transitionForm.processing}>
                                    Advance booking
                                </Button>
                            </div>
                        </form>
                    </ModalContent>
                </Modal>
            ) : null}
        </div>
    );
}