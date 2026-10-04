import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Sparkles } from 'lucide-react';
import type { PageProps } from '@/types';

import { Button } from '@/Components/UI/Button';
import { EmptyState } from '@/Components/Feedback/EmptyState';
import { Badge } from '@/Components/UI/Badge';
import { formatCurrency } from '@/Lib/currency';
import AtelierLayout from '@/Layouts/AtelierLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn, resolveImageUrl } from '@/Lib/utils';

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
    const { t, tr, isRtl } = useLanguage();
    const [search, setSearch] = useState('');

    const getStatusLabel = (st: string): string => {
        return t(`status.${st}`, st);
    };

    const getStatusTone = (st: string): 'success' | 'warning' | 'danger' | 'info' | 'champagne' => {
        switch (st) {
            case 'active':
                return 'success';
            case 'reserved':
            case 'alteration':
                return 'warning';
            case 'maintenance':
            case 'retired':
                return 'danger';
            case 'rented':
            case 'cleaning':
                return 'info';
            default:
                return 'champagne';
        }
    };

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
            title={t('atelier.dresses.title')}
            breadcrumbs={[{ label: t('atelier.nav.dresses') }]}
        >
            <Head title={`${t('atelier.nav.dresses')} | ${atelier.business_name}`} />

            <div className="space-y-6">
                {/* Header Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400", isRtl ? "right-3" : "left-3")} />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('atelier.dresses.search_placeholder')}
                            aria-label="Search garments"
                            className={cn(
                                "w-full rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-2xs",
                                isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                            )}
                        />
                    </div>

                    <Button asChild variant="champagne" size="sm" className="text-xs font-semibold shrink-0">
                        <Link href={`/atelier/${atelier.id}/dresses/create`}>
                            <Plus className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} aria-hidden="true" />
                            {t('atelier.dresses.add_new')}
                        </Link>
                    </Button>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Filter by status">
                    <button
                        type="button"
                        aria-pressed={status === null}
                        onClick={() => setStatus(null)}
                        className={cn(
                            "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                            status === null
                                ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs"
                                : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                        )}
                    >
                        {t('atelier.dresses.filter_all')}
                    </button>
                    {STATUSES.map((value) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={status === value}
                            onClick={() => setStatus(value)}
                            className={cn(
                                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                                status === value
                                    ? "bg-amber-600 text-white shadow-xs"
                                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                            )}
                        >
                            {getStatusLabel(value)}
                        </button>
                    ))}
                </div>

                {/* Garments Grid or Empty State */}
                {visible.length === 0 ? (
                    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-12 text-center shadow-xs">
                        <Sparkles className="h-12 w-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                        <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                            {t('atelier.dresses.no_dresses')}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto mb-4">
                            {t('atelier.dresses.no_dresses_hint')}
                        </p>
                        <Button asChild variant="champagne" size="sm" className="text-xs">
                            <Link href={`/atelier/${atelier.id}/dresses/create`}>
                                <Plus className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} />
                                {t('atelier.dresses.add_new')}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {visible.map((dress) => {
                            return (
                                <article
                                    key={dress.id}
                                    className="group overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <Link href={`/atelier/${atelier.id}/dresses/${dress.id}/edit`} className="block">
                                        <div className="aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
                                            {dress.primary_image ? (
                                                <img
                                                    src={resolveImageUrl(dress.primary_image)}
                                                    alt={dress.title}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center font-sans text-xs text-stone-400">
                                                    {t('atelier.dresses.no_image')}
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <Badge tone={getStatusTone(dress.status)}>
                                                    {getStatusLabel(dress.status)}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-2">
                                            <span className="text-[11px] uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400">
                                                {dress.category ?? 'Haute Couture'}
                                            </span>
                                            <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                                                {dress.title}
                                            </h3>
                                            <p className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                                                {formatCurrency(dress.rental_price_per_day, 'EGP')}
                                                <span className="text-xs font-normal text-stone-400"> {t('atelier.dresses.per_day')}</span>
                                            </p>
                                        </div>
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
                        <span>
                            {t('atelier.dresses.showing_page')} {pagination.current_page} {t('atelier.dresses.of')} {pagination.last_page} · {pagination.total} {t('atelier.dresses.garments')}
                        </span>
                        <div className="flex gap-2">
                            {pagination.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() =>
                                        router.get(
                                            `/atelier/${atelier.id}/dresses`,
                                            { status: status ?? undefined, page: pagination.current_page - 1 },
                                            { preserveState: true, preserveScroll: true },
                                        )
                                    }
                                >
                                    {t('atelier.dresses.prev')}
                                </Button>
                            )}
                            {pagination.current_page < pagination.last_page && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() =>
                                        router.get(
                                            `/atelier/${atelier.id}/dresses`,
                                            { status: status ?? undefined, page: pagination.current_page + 1 },
                                            { preserveState: true, preserveScroll: true },
                                        )
                                    }
                                >
                                    {t('atelier.dresses.next')}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AtelierLayout>
    );
}