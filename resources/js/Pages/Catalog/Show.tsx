import type { PageProps } from '../../types';

import { DressDetailsView } from '../../Modules/Catalog';
import type { DressDetail } from '../../types/contracts';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

type CatalogShowProps = PageProps<{
    dress: DressDetail;
}>;

export default function CatalogShow({ dress }: CatalogShowProps) {
    return (
        <StorefrontLayout>
            <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
                <DressDetailsView dress={dress} />
            </div>
        </StorefrontLayout>
    );
}