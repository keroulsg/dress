import type { PageProps } from '../../types';

import { CatalogBrowser } from '../../Modules/Catalog';
import type { CatalogFacets, CatalogFilters, DressCard, PaginationMeta } from '../../types/contracts';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

type CatalogIndexProps = PageProps<{
    dresses: DressCard[];
    facets: CatalogFacets;
    filters: CatalogFilters;
    pagination: PaginationMeta;
    categories: { id: number; name: string }[];
}>;

export default function CatalogIndex({ dresses, facets, filters, pagination, categories }: CatalogIndexProps) {
    return (
        <StorefrontLayout>
            <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
                <header className="mb-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-luxe text-stone-muted">The Collection</p>
                    <h1 className="mt-2 font-display text-4xl text-charcoal">Rent the Moment</h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-muted">
                        Designer gowns and couture, cleaned and pressed, delivered for life's unforgettable occasions.
                    </p>
                </header>

                <CatalogBrowser
                    dresses={dresses}
                    facets={facets}
                    filters={filters}
                    pagination={pagination}
                    categories={categories}
                />
            </div>
        </StorefrontLayout>
    );
}