import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '../../../types';

import { BookingTimeline } from '../../../Modules/Booking';
import { formatCurrency } from '../../../Lib/currency';
import { Button } from '../../../Components/UI/Button';
import { Modal, ModalContent, ModalTitle } from '../../../Components/UI/Modal';
import { Textarea } from '../../../Components/UI/Textarea';
import CustomerLayout from '../../../Layouts/CustomerLayout';

type BookingsShowProps = PageProps<{
    booking: {
        id: number;
        booking_reference: string;
        status: string;
        fitting_datetime: string | null;
        start_date: string | null;
        end_date: string | null;
        grand_total: string;
        currency: string;
        rental_rate_total: string;
        cleaning_fee_total: string;
        security_deposit_amount: string;
        items: Array<{ dress_title: string | null; quantity: number; unit_rental_price: string; rental_days: number; subtotal: string }>;
    };
}>;

const CANCELLABLE = ['pending_payment', 'confirmed', 'fitting_scheduled', 'ready_for_dispatch'];

export default function BookingsShow({ booking }: BookingsShowProps) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const cancelForm = useForm({ reason: '' });

    const submitCancel = (): void => {
        cancelForm.post(`/account/bookings/${booking.id}/cancel`, {
            onSuccess: () => setCancelOpen(false),
        });
    };

    return (
        <CustomerLayout>
            <p className="font-mono text-xs text-stone-muted">{booking.booking_reference}</p>
            <h1 className="mt-1 font-display text-3xl text-charcoal">Booking details</h1>

            <div className="mt-8 grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <BookingTimeline
                        status={booking.status}
                        startDate={booking.start_date ?? ''}
                        endDate={booking.end_date ?? ''}
                        fittingDatetime={booking.fitting_datetime ?? undefined}
                        actions={
                            CANCELLABLE.includes(booking.status)
                                ? [{ label: 'Cancel booking', tone: 'danger', onClick: () => setCancelOpen(true) }]
                                : []
                        }
                    />
                </div>

                <div className="lg:col-span-2">
                    <div className="border border-stone-line bg-white p-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-luxe text-stone-muted">Summary</p>
                        {booking.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between border-b border-stone-line py-2 text-sm">
                                <span className="text-charcoal">{item.dress_title ?? 'Dress rental'}</span>
                                <span className="text-stone-muted">
                                    {item.quantity} × {formatCurrency(item.unit_rental_price, booking.currency)} × {item.rental_days}d
                                </span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-2 text-sm">
                            <span className="text-stone-muted">Rental</span>
                            <span>{formatCurrency(booking.rental_rate_total, booking.currency)}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 text-sm">
                            <span className="text-stone-muted">Cleaning fee</span>
                            <span>{formatCurrency(booking.cleaning_fee_total, booking.currency)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-stone-line pt-3">
                            <span className="font-medium text-charcoal">Total held</span>
                            <span className="font-semibold text-charcoal">{formatCurrency(booking.grand_total, booking.currency)}</span>
                        </div>
                        <div className="mt-2 rounded-none bg-ivory px-3 py-2.5 text-sm">
                            <span className="text-stone-muted">Refundable deposit</span>
                            <span className="float-right font-semibold text-charcoal">
                                {formatCurrency(booking.security_deposit_amount, booking.currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={cancelOpen} onOpenChange={setCancelOpen}>
                <ModalContent>
                    <ModalTitle className="font-display text-2xl text-charcoal">Cancel booking</ModalTitle>
                    <p className="mt-2 text-sm text-stone-muted">
                        Cancelling releases the reserved dates immediately. Reason is recorded for our records.
                    </p>
                    <div className="mt-4 space-y-3">
                        <Textarea
                            value={cancelForm.data.reason}
                            onChange={(event) => cancelForm.setData('reason', event.target.value)}
                            placeholder="Why are you cancelling?"
                            aria-label="Cancellation reason"
                        />
                        {cancelForm.errors.reason ? (
                            <p className="text-xs text-danger">{cancelForm.errors.reason}</p>
                        ) : null}
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCancelOpen(false)}>
                                Keep booking
                            </Button>
                            <Button variant="danger" onClick={submitCancel} disabled={cancelForm.processing || !cancelForm.data.reason.trim()}>
                                {cancelForm.processing ? 'Cancelling…' : 'Cancel booking'}
                            </Button>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        </CustomerLayout>
    );
}