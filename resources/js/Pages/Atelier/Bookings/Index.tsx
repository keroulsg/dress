import type { PageProps } from '../../../types';

import { OrdersManagement } from '../../../Modules/Atelier/OrdersManagement';
import type { OrdersManagementBooking } from '../../../Modules/Atelier/OrdersManagement';
import AtelierLayout from '../../../Layouts/AtelierLayout';

type BookingsIndexProps = PageProps<{
    atelier: { id: number; business_name: string };
    bookings: OrdersManagementBooking[];
    pagination: { total: number; current_page: number; last_page: number };
    status: string | null;
    statuses: string[];
}>;

export default function BookingsIndex({ atelier, bookings, statuses }: BookingsIndexProps) {
    return (
        <AtelierLayout title="Booking pipeline" breadcrumbs={[{ label: 'Bookings' }]}>
            <OrdersManagement atelierId={atelier.id} bookings={bookings} statuses={statuses} />
        </AtelierLayout>
    );
}