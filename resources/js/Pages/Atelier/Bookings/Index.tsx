import React from 'react';
import { Head } from '@inertiajs/react';
import type { PageProps } from '@/types';

import { OrdersManagement } from '@/Modules/Atelier/OrdersManagement';
import type { OrdersManagementBooking } from '@/Modules/Atelier/OrdersManagement';
import AtelierLayout from '@/Layouts/AtelierLayout';
import { useLanguage } from '@/Contexts/LanguageContext';

type BookingsIndexProps = PageProps<{
    atelier: { id: number; business_name: string };
    bookings: OrdersManagementBooking[];
    pagination: { total: number; current_page: number; last_page: number };
    status: string | null;
    statuses: string[];
}>;

export default function BookingsIndex({ atelier, bookings, statuses }: BookingsIndexProps) {
    const { t, isRtl } = useLanguage();

    return (
        <AtelierLayout
            title={t('atelier.bookings.title')}
            breadcrumbs={[{ label: t('atelier.nav.bookings') }]}
        >
            <Head title={`${t('atelier.nav.bookings')} | ${atelier.business_name}`} />
            <OrdersManagement atelierId={atelier.id} bookings={bookings} statuses={statuses} />
        </AtelierLayout>
    );
}