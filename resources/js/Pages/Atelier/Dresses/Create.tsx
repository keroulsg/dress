import type { PageProps } from '../../../types';

import { DressCreateEdit } from '../../../Modules/Atelier/DressCreateEdit';
import type { CategoryOption } from '../../../types/contracts';
import AtelierLayout from '../../../Layouts/AtelierLayout';

type DressesCreateProps = PageProps<{
    atelier: { id: number; business_name: string };
    categories: CategoryOption[];
}>;

export default function DressesCreate({ atelier, categories }: DressesCreateProps) {
    return (
        <AtelierLayout title="Add a garment" breadcrumbs={[{ label: 'Inventory', href: `/atelier/${atelier.id}/dresses` }, { label: 'Add garment' }]}>
            <div className="mx-auto max-w-3xl">
                <DressCreateEdit mode="create" atelier={atelier} categories={categories} />
            </div>
        </AtelierLayout>
    );
}