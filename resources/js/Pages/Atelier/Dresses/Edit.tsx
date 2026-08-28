import type { PageProps } from '../../../types';

import { DressCreateEdit } from '../../../Modules/Atelier/DressCreateEdit';
import type { CategoryOption } from '../../../types/contracts';
import AtelierLayout from '../../../Layouts/AtelierLayout';

type DressesEditProps = PageProps<{
    atelier: { id: number; business_name: string };
    categories: CategoryOption[];
    dress: {
        id: number;
        title: string;
        category_id: number;
        description: string | null;
        fabric_type: string | null;
        silhouette: string | null;
        color_primary: string | null;
        original_retail_value: string;
        rental_price_per_day: string;
        security_deposit_amount: string;
        cleaning_fee: string;
        late_fee_per_day: string;
        turnaround_buffer_days: number;
        condition_rating: string;
        status: string;
        sizes: { id: number; size_code: string; bust: string | null; waist: string | null; hips: string | null; length: string | null; is_available: boolean }[];
        images: { id: number; path: string; thumbnail: string | null; is_primary: boolean; alt_text: string | null }[];
    };
}>;

export default function DressesEdit({ atelier, categories, dress }: DressesEditProps) {
    return (
        <AtelierLayout
            title={`Edit — ${dress.title}`}
            breadcrumbs={[{ label: 'Inventory', href: `/atelier/${atelier.id}/dresses` }, { label: dress.title }]}
        >
            <div className="mx-auto max-w-3xl">
                <DressCreateEdit mode="edit" atelier={atelier} categories={categories} dress={dress} />
            </div>
        </AtelierLayout>
    );
}