import { Link } from '@inertiajs/react';
import type { PageProps } from '../../../types';

import { formatDateRange } from '../../../Lib/dates';
import { formatCurrency } from '../../../Lib/currency';
import { bookingStatus } from '../../../Lib/tokens';
import { EmptyState } from '../../../Components/Feedback/EmptyState';
import CustomerLayout from '../../../Layouts/CustomerLayout';

type BookingsIndexProps = PageProps<{
    bookings: Array<{
        id: number;
        booking_reference: string;
        status: string;
        start_date: string | null;
        end_date: string | null;
        grand_total: string;
        currency: string;
        atelier: string | null;
        dress_title: string | null;
    }>;
    pagination: { total: number; current_page: number; last_page: number };
}>;

export default function BookingsIndex({ bookings }: BookingsIndexProps) {
    return (
        <CustomerLayout>
            <h1 className="font-display text-3xl text-charcoal">My bookings</h1>

            {bookings.length === 0 ? (
                <div className="mt-8">
                    <EmptyState
                        title="No bookings yet"
                        description="Browse the collection and reserve your first dress."
                        actionLabel="Browse collection"
                        onAction={() => window.location.assign('/catalog')}
                    />
                </div>
            ) : (
                <ul className="mt-8 space-y-4">
                    {bookings.map((booking) => {
                        const meta = bookingStatus[booking.status] ?? { color: '#78716C', label: booking.status };

                        return (
                            <li key={booking.id}>
                                <Link
                                    href={`/account/bookings/${booking.id}`}
                                    className="block border border-stone-line bg-white p-5 transition-colors hover:border-champagne"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-mono text-xs text-stone-muted">{booking.booking_reference}</p>
                                            <h2 className="mt-1 font-display text-xl text-charcoal">
                                                {booking.dress_title ?? 'Dress rental'}
                                            </h2>
                                            <p className="mt-1 text-sm text-stone-muted">
                                                {booking.start_date && booking.end_date
                                                    ? formatDateRange(booking.start_date, booking.end_date)
                                                    : '—'}
                                                {booking.atelier ? ` · ${booking.atelier}` : ''}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                style={{ color: meta.color, backgroundColor: `${meta.color}18` }}
                                            >
                                                {meta.label}
                                            </span>
                                            <p className="mt-2 text-sm font-semibold text-charcoal">
                                                {formatCurrency(booking.grand_total, booking.currency)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </CustomerLayout>
    );
}