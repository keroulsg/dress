import type { PageProps } from '../../types';

import { BookingWizard } from '../../Modules/Booking';
import type { BookingWizardDress } from '../../Modules/Booking';
import type { PricingBreakdown } from '../../types/contracts';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

type CheckoutIndexProps = PageProps<{
    dress: BookingWizardDress & { id: number };
    quote: PricingBreakdown;
}>;

export default function CheckoutIndex({ dress }: CheckoutIndexProps) {
    return (
        <StorefrontLayout>
            <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
                <header className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-luxe text-stone-muted">Secure Checkout</p>
                    <h1 className="mt-2 font-display text-3xl text-charcoal">Book your rental</h1>
                </header>

                <BookingWizard dress={dress} />
            </div>
        </StorefrontLayout>
    );
}