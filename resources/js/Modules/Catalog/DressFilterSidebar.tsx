import { X } from 'lucide-react';
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';

import { Input } from '../../Components/UI/Input';
import { cn } from '../../Lib/utils';

export interface DressFilterSidebarFacets {
    sizes: string[];
    silhouettes: string[];
    fabrics: string[];
    colors: string[];
    price_min: number;
    price_max: number;
}

export interface DressFilterSidebarFilters {
    categories: number[];
    sizes: string[];
    silhouettes: string[];
    fabrics: string[];
    colors: string[];
    price_min: number | null;
    price_max: number | null;
    sort: string;
}

export interface DressFilterSidebarProps {
    facets: DressFilterSidebarFacets;
    filters: DressFilterSidebarFilters;
    categories: { id: number; name: string }[];
    onChange: (patch: Partial<DressFilterSidebarFilters>) => void;
    onReset: () => void;
    open: boolean;
    onClose: () => void;
}

type FacetArrayKey = 'sizes' | 'silhouettes' | 'fabrics' | 'colors';

const SECTION_LABEL = 'text-xs uppercase tracking-luxe text-stone-muted';

function FilterSection({ legend, children }: { legend: string; children: ReactNode }) {
    return (
        <fieldset className="space-y-3">
            <legend className={SECTION_LABEL}>{legend}</legend>
            {children}
        </fieldset>
    );
}

interface ToggleChipGroupProps {
    options: string[];
    active: string[];
    label: string;
    onToggle: (value: string) => void;
}

function ToggleChipGroup({ options, active, label, onToggle }: ToggleChipGroupProps) {
    if (options.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => {
                const pressed = active.includes(option);

                return (
                    <button
                        key={option}
                        type="button"
                        aria-pressed={pressed}
                        aria-label={`${label}: ${option}`}
                        onClick={() => onToggle(option)}
                        className={cn(
                            'border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                            pressed
                                ? 'border-champagne bg-champagne/15 text-rose-deep'
                                : 'border-stone-line bg-white text-stone-muted hover:border-champagne hover:text-charcoal',
                        )}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
}

interface PriceFieldsProps {
    facets: DressFilterSidebarFacets;
    filters: DressFilterSidebarFilters;
    onChange: (patch: Partial<DressFilterSidebarFilters>) => void;
}

function PriceFields({ facets, filters, onChange }: PriceFieldsProps) {
    const [minDraft, setMinDraft] = useState(filters.price_min === null ? '' : String(filters.price_min));
    const [maxDraft, setMaxDraft] = useState(filters.price_max === null ? '' : String(filters.price_max));

    useEffect(() => {
        setMinDraft(filters.price_min === null ? '' : String(filters.price_min));
    }, [filters.price_min]);

    useEffect(() => {
        setMaxDraft(filters.price_max === null ? '' : String(filters.price_max));
    }, [filters.price_max]);

    const commit = (field: 'min' | 'max'): void => {
        const raw = field === 'min' ? minDraft : maxDraft;
        const setDraft = field === 'min' ? setMinDraft : setMaxDraft;

        if (raw.trim() === '') {
            onChange(field === 'min' ? { price_min: null } : { price_max: null });
            setDraft('');
            return;
        }

        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) {
            setDraft(field === 'min' ? String(filters.price_min ?? '') : String(filters.price_max ?? ''));
            return;
        }

        const lo = facets.price_min;
        const hi = facets.price_max;
        const clamped = field === 'min' ? Math.min(Math.max(parsed, lo), hi) : Math.max(Math.min(parsed, hi), lo);

        onChange(field === 'min' ? { price_min: clamped } : { price_max: clamped });
        setDraft(String(clamped));
    };

    const commitOnEnter = (field: 'min' | 'max') => (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            commit(field);
            event.currentTarget.blur();
        }
    };

    return (
        <div className="flex items-end gap-3">
            <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-stone-muted">Min</span>
                <Input
                    type="number"
                    inputMode="numeric"
                    min={facets.price_min}
                    max={facets.price_max}
                    placeholder={String(facets.price_min)}
                    value={minDraft}
                    onChange={(event) => setMinDraft(event.target.value)}
                    onBlur={() => commit('min')}
                    onKeyDown={commitOnEnter('min')}
                    aria-label="Minimum price"
                />
            </label>
            <span className="pb-2.5 text-xs text-stone-muted" aria-hidden="true">
                —
            </span>
            <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-stone-muted">Max</span>
                <Input
                    type="number"
                    inputMode="numeric"
                    min={facets.price_min}
                    max={facets.price_max}
                    placeholder={String(facets.price_max)}
                    value={maxDraft}
                    onChange={(event) => setMaxDraft(event.target.value)}
                    onBlur={() => commit('max')}
                    onKeyDown={commitOnEnter('max')}
                    aria-label="Maximum price"
                />
            </label>
        </div>
    );
}

interface SidebarContentProps {
    facets: DressFilterSidebarFacets;
    filters: DressFilterSidebarFilters;
    categories: { id: number; name: string }[];
    onChange: (patch: Partial<DressFilterSidebarFilters>) => void;
    onReset: () => void;
}

function SidebarContent({ facets, filters, categories, onChange, onReset }: SidebarContentProps) {
    const toggleValue = (key: FacetArrayKey, value: string): void => {
        const current = filters[key];

        onChange({
            [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
        } as Partial<DressFilterSidebarFilters>);
    };

    const toggleCategory = (id: number): void => {
        onChange({
            categories: filters.categories.includes(id)
                ? filters.categories.filter((item) => item !== id)
                : [...filters.categories, id],
        });
    };

    const activeCount =
        filters.sizes.length +
        filters.silhouettes.length +
        filters.fabrics.length +
        filters.colors.length +
        filters.categories.length +
        (filters.price_min !== null ? 1 : 0) +
        (filters.price_max !== null ? 1 : 0);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-charcoal">Filters</h2>
                {activeCount > 0 ? (
                    <button
                        type="button"
                        onClick={onReset}
                        className="text-xs uppercase tracking-wider text-rose underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                    >
                        Clear all
                    </button>
                ) : null}
            </div>

            <FilterSection legend="Category">
                {categories.length > 0 ? (
                    <div className="space-y-2">
                        {categories.map((category) => {
                            const checked = filters.categories.includes(category.id);

                            return (
                                <label
                                    key={category.id}
                                    className="flex cursor-pointer items-center gap-2 text-sm text-charcoal"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleCategory(category.id)}
                                        className="h-4 w-4 rounded-none border-stone-line text-champagne focus-visible:ring-rose"
                                    />
                                    {category.name}
                                </label>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-stone-muted">No categories available.</p>
                )}
            </FilterSection>

            <FilterSection legend="Size">
                <ToggleChipGroup
                    options={facets.sizes}
                    active={filters.sizes}
                    label="Size"
                    onToggle={(value) => toggleValue('sizes', value)}
                />
            </FilterSection>

            <FilterSection legend="Silhouette">
                <ToggleChipGroup
                    options={facets.silhouettes}
                    active={filters.silhouettes}
                    label="Silhouette"
                    onToggle={(value) => toggleValue('silhouettes', value)}
                />
            </FilterSection>

            <FilterSection legend="Fabric">
                <ToggleChipGroup
                    options={facets.fabrics}
                    active={filters.fabrics}
                    label="Fabric"
                    onToggle={(value) => toggleValue('fabrics', value)}
                />
            </FilterSection>

            <FilterSection legend="Colour">
                <ToggleChipGroup
                    options={facets.colors}
                    active={filters.colors}
                    label="Colour"
                    onToggle={(value) => toggleValue('colors', value)}
                />
            </FilterSection>

            <FilterSection legend="Price per day">
                <PriceFields facets={facets} filters={filters} onChange={onChange} />
            </FilterSection>
        </div>
    );
}

export function DressFilterSidebar({
    facets,
    filters,
    categories,
    onChange,
    onReset,
    open,
    onClose,
}: DressFilterSidebarProps) {
    const contentProps = { facets, filters, categories, onChange, onReset };

    return (
        <>
            <div
                className={cn('fixed inset-0 z-50 lg:hidden', !open && 'pointer-events-none invisible')}
                aria-hidden={!open}
            >
                <div
                    className={cn(
                        'absolute inset-0 bg-charcoal/40 transition-opacity duration-300',
                        open ? 'opacity-100' : 'opacity-0',
                    )}
                    onClick={onClose}
                    aria-hidden="true"
                />
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Dress filters"
                    className={cn(
                        'absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white shadow-lifted transition-transform duration-300 ease-out',
                        open ? 'translate-x-0' : '-translate-x-full',
                    )}
                >
                    <header className="flex items-center justify-between border-b border-stone-line px-6 py-4">
                        <h2 className="font-display text-xl text-charcoal">Filters</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close filters"
                            className="rounded-none p-1 text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </header>
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <SidebarContent {...contentProps} />
                    </div>
                </div>
            </div>

            <aside className="hidden lg:block">
                <SidebarContent {...contentProps} />
            </aside>
        </>
    );
}
