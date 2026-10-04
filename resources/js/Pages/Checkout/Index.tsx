import type { PageProps } from '../../types';
import { Head } from '@inertiajs/react';

import { BookingWizard } from '../../Modules/Booking';
import type { BookingWizardDress } from '../../Modules/Booking';
import type { PricingBreakdown } from '../../types/contracts';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import { useLanguage } from '../../Contexts/LanguageContext';

type CheckoutIndexProps = PageProps<{
    dress: BookingWizardDress & { id: number };
    quote: PricingBreakdown;
    user_kyc?: { is_verified: boolean; status: string };
}>;

export default function CheckoutIndex({ dress, user_kyc }: CheckoutIndexProps) {
    const { tr } = useLanguage();

    return (
        <StorefrontLayout>
            <Head title={`${tr('حجز وشراء الفستان', 'Reserve or Purchase Gown')} | ${dress.title}`} />
            <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
                <header className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {tr('إتمام الطلب والدفع الآمن', 'Secure Checkout')}
                    </p>
                    <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                        {tr('حجز فستان للإيجار أو شراء وتملك نهائي', 'Reserve Rental or Purchase Gown')}
                    </h1>
                </header>

                <BookingWizard dress={dress} userKyc={user_kyc} />
            </div>
        </StorefrontLayout>
    );
}