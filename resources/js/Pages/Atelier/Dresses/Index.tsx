import { Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import type { PageProps } from '../../../types';

import { Button } from '../../../Components/UI/Button';
import { EmptyState } from '../../../Components/Feedback/EmptyState';
import { dressStatus } from '../../../Lib/tokens';
import { formatCurrency } from '../../../Lib/currency';
import AtelierLayout from '../../../Layouts/AtelierLayout';
import { useState } from 'react';

type DressesIndexProps = PageProps<{
    atelier: { id: number; business_name: string };
    dresses: Array<{
        id: number;
        title: string;
        slug: string;
        status: string;
        rental_price_per_day: string;
        primary_image: string | null;
        category: string | null;
        updated_at: string | null;
    }>;
    pagination: { total: number; per_page: number; current_page: number; last_page: number };
    status: string | null;
}>;

const STATUSES = ['draft', 'active', 'rented', 'reserved', 'maintenance', 'cleaning', 'alteration', 'retired'];

export default function DressesIndex({ atelier, dresses, pagination, status }: DressesIndexProps) {
    const [search, setSearch] = useState('');

    const visible = search.trim()
        ? dresses.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()))
        : dresses;

    const setStatus = (value: string | null): void => {
        router.get(`/atelier/${atelier.id}/dresses`, value ? { status: value } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AtelierLayout
            title="Garment inventory"
            breadcrumbs={[{ label: 'Inventory' }]}
        >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex max-w-xs flex-1 items-center gap-2 border border-stone-line bg-white px-3">
                    <Search className="h-4 w-4 text-stone-muted" aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search your garments…"
                        aria-label="Search garments"
                        className="h-10 w-full bg-transparent text-sm text-charcoal placeholder:text-stone-muted focus:outline-none"
                    />
                </div>
                <Button asChild variant="primary">
                    <Link href={`/atelier/${atelier.id}/dresses/create`}>
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add garment
                    </Link>
                </Button>
            </div>

            <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
                <button
                    type="button"
                    aria-pressed={status === null}
                    onClick={() => setStatus(null)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                        status === null ? 'bg-charcoal text-white' : 'bg-white text-stone-muted hover:text-charcoal'
                    }`}
                >
                    All
                </button>
                {STATUSES.map((value) => (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={status === value}
                        onClick={() => setStatus(value)}
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${
                            status === value ? 'bg-charcoal text-white' : 'bg-white text-stone-muted hover:text-charcoal'
                        }`}
                    >
                        {dressStatus[value]?.label ?? value}
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <EmptyState
                    title="No garments yet"
                    description="Add your first dress to start renting."
                    actionLabel="Add garment"
                    onAction={() => router.get(`/atelier/${atelier.id}/dresses/create`)}
                />
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((dress) => {
                        const meta = dressStatus[dress.status] ?? dressStatus.draft;

                        return (
                            <article key={dress.id} className="group overflow-hidden border border-stone-line bg-white">
                                <Link href={`/atelier/${atelier.id}/dresses/${dress.id}/edit`} className="block">
                                    <div className="aspect-[4/3] overflow-hidden bg-stone-line/40">
                                        {dress.primary_image ? (
                                            <img
                                                src={dress.primary_image}
                                                alt={dress.title}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center font-display text-stone-muted">
                                                No photo
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs uppercase tracking-wider text-stone-muted">
                                                {dress.category ?? 'Uncategorized'}
                                            </span>
                                            <span
                                                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                style={{ color: meta.color, backgroundColor: `${meta.color}18` }}
                                            >
                                                {meta.label}
                                            </span>
                                        </div>
                                        <h3 className="mt-2 font-display text-lg text-charcoal">{dress.title}</h3>
                                        <p className="mt-1 text-sm text-charcoal">
                                            {formatCurrency(dress.rental_price_per_day, 'EGP')}
                                            <span className="text-xs text-stone-muted"> / day</span>
                                        </p>
                                    </div>
                                </Link>
                            </article>
                        );
                    })}
                </div>
            )}

            {pagination.last_page > 1 ? (
                <div className="mt-8 flex items-center justify-between text-sm">
                    <span className="text-stone-muted">
                        Showing page {pagination.current_page} of {pagination.last_page} · {pagination.total} garments
                    </span>
                    <div className="flex gap-2">
                        {pagination.current_page > 1 ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get(
                                        `/atelier/${atelier.id}/dresses`,
                                        { status: status ?? undefined, page: pagination.current_page - 1 },
                                        { preserveState: true, preserveScroll: true },
                                    )
                                }
                            >
                                Previous
                            </Button>
                        ) : null}
                        {pagination.current_page < pagination.last_page ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.get(
                                        `/atelier/${atelier.id}/dresses`,
                                        { status: status ?? undefined, page: pagination.current_page + 1 },
                                        { preserveState: true, preserveScroll: true },
                                    )
                                }
                            >
                                Next
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </AtelierLayout>
    );
}