import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, LayoutGrid, Rows3, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '../../Components/Feedback/EmptyState';
import { Button } from '../../Components/UI/Button';
import { Select } from '../../Components/UI/Select';
import { cn } from '../../Lib/utils';
import type { DressCardProps } from './DressCard';
import {
    DressFilterSidebar,
    type DressFilterSidebarFacets,
    type DressFilterSidebarFilters,
} from './DressFilterSidebar';
import { DressGrid } from './DressGrid';

export interface CatalogBrowserProps {
    dresses: DressCardProps['dress'][];
    facets: DressFilterSidebarFacets;
    filters: DressFilterSidebarFilters;
    pagination: { total: number; per_page: number; current_page: number; last_page: number };
    categories: { id: number; name: string }[];
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
] as const;

const EMPTY_FILTERS: DressFilterSidebarFilters = {
    categories: [],
    sizes: [],
    silhouettes: [],
    fabrics: [],
    colors: [],
    price_min: null,
    price_max: null,
    sort: 'newest',
};

function buildQuery(
    filters: DressFilterSidebarFilters,
    page?: number,
): Record<string, string | number | number[] | string[]> {
    const query: Record<string, string | number | number[] | string[]> = {};

    if (filters.sort && filters.sort !== 'newest') {
        query.sort = filters.sort;
    }
    if (filters.categories.length > 0) {
        query.category = filters.categories;
    }
    if (filters.sizes.length > 0) {
        query.sizes = filters.sizes;
    }
    if (filters.silhouettes.length > 0) {
        query.silhouettes = filters.silhouettes;
    }
    if (filters.fabrics.length > 0) {
        query.fabrics = filters.fabrics;
    }
    if (filters.colors.length > 0) {
        query.colors = filters.colors;
    }
    if (filters.price_min !== null && filters.price_min !== undefined) {
        query.price_min = filters.price_min;
    }
    if (filters.price_max !== null && filters.price_max !== undefined) {
        query.price_max = filters.price_max;
    }
    if (page) {
        query.page = page;
    }

    return query;
}

export function CatalogBrowser({ dresses, facets, filters, pagination, categories }: CatalogBrowserProps) {
    const [view, setView] = useState<'compact' | 'editorial'>('editorial');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigate = (next: DressFilterSidebarFilters, page?: number): void => {
        router.get('/catalog', buildQuery(next, page), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePatch = (patch: Partial<DressFilterSidebarFilters>): void => {
        navigate({ ...filters, ...patch });
    };

    const handleReset = (): void => {
        navigate(EMPTY_FILTERS);
    };

    const handleSort = (value: string): void => {
        navigate({ ...filters, sort: value });
    };

    const goToPage = (page: number): void => {
        navigate(filters, page);
    };

    return (
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
            <DressFilterSidebar
                facets={facets}
                filters={filters}
                categories={categories}
                onChange={handlePatch}
                onReset={handleReset}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="mt-8 lg:mt-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-line pb-5">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                            Filters
                        </Button>
                        <p className="text-sm text-stone-muted">
                            {pagination.total} {pagination.total === 1 ? 'dress' : 'dresses'}
                        </p>
                    </div>

                    <div className="flex w-full items-center gap-3 sm:w-auto">
                        <Select
                            value={filters.sort}
                            onChange={(event) => handleSort(event.target.value)}
                            aria-label="Sort dresses"
                            className="w-full sm:w-auto"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>

                        <div className="flex shrink-0 items-center gap-0.5 border border-stone-line bg-white">
                            <button
                                type="button"
                                aria-label="Editorial view"
                                aria-pressed={view === 'editorial'}
                                onClick={() => setView('editorial')}
                                className={cn(
                                    'p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                    view === 'editorial'
                                        ? 'bg-charcoal text-white'
                                        : 'bg-white text-stone-muted hover:text-charcoal',
                                )}
                            >
                                <Rows3 className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                aria-label="Compact view"
                                aria-pressed={view === 'compact'}
                                onClick={() => setView('compact')}
                                className={cn(
                                    'p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                    view === 'compact'
                                        ? 'bg-charcoal text-white'
                                        : 'bg-white text-stone-muted hover:text-charcoal',
                                )}
                            >
                                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    {dresses.length > 0 ? (
                        <DressGrid dresses={dresses} view={view} />
                    ) : (
                        <EmptyState
                            title="No dresses match your filters"
                            description="Try widening your price range or clearing a few filters to see more pieces."
                        />
                    )}
                </div>

                {pagination.last_page > 1 ? (
                    <nav
                        className="mt-12 flex items-center justify-between border-t border-stone-line pt-6"
                        aria-label="Catalog pagination"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page <= 1}
                            onClick={() => goToPage(pagination.current_page - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            Previous
                        </Button>
                        <p className="text-sm text-stone-muted">
                            Page {pagination.current_page} of {pagination.last_page}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page >= pagination.last_page}
                            onClick={() => goToPage(pagination.current_page + 1)}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </nav>
                ) : null}
            </div>
        </div>
    );
}
