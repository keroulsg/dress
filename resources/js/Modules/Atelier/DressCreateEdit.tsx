import { useForm } from '@inertiajs/react';
import { Check, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';

import { Alert } from '../../Components/Feedback/Alert';
import { Button } from '../../Components/UI/Button';
import { Input } from '../../Components/UI/Input';
import { Select } from '../../Components/UI/Select';
import { Textarea } from '../../Components/UI/Textarea';
import { formatCurrency } from '../../Lib/currency';
import { cn } from '../../Lib/utils';

const PREVIEW_CURRENCY = 'EGP';
const QUOTE_DAYS = 3;

const SIZE_CODES = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'CUSTOM'] as const;

const CONDITION_OPTIONS = [
    { value: 'brand_new', label: 'Brand new' },
    { value: 'like_new', label: 'Like new' },
    { value: 'good', label: 'Good' },
    { value: 'minor_flaws', label: 'Minor flaws' },
] as const;

const STEPS = [
    { key: 'basic', label: 'Basic info' },
    { key: 'pricing', label: 'Pricing & deposit' },
    { key: 'sizes', label: 'Dimensions & sizes' },
    { key: 'media', label: 'Media & sorting' },
] as const;

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

interface SizeRow {
    size_code: string;
    bust: string;
    waist: string;
    hips: string;
    length: string;
    is_available: boolean;
}

interface ImagePreview {
    id: string;
    file: File;
    url: string;
}

interface DressFormData {
    title: string;
    category_id: string;
    description: string;
    fabric_type: string;
    silhouette: string;
    color_primary: string;
    condition_rating: string;
    turnaround_buffer_days: string;
    rental_price_per_day: string;
    security_deposit_amount: string;
    cleaning_fee: string;
    late_fee_per_day: string;
    original_retail_value: string;
    sizes: SizeRow[];
    images: File[];
}

type DressFormErrors = Partial<Record<keyof DressFormData, string>>;

export interface DressCreateEditProps {
    mode: 'create' | 'edit';
    atelier: { id: number; business_name: string };
    categories: { id: number; name: string }[];
    dress?: {
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
        sizes: Array<{
            id: number;
            size_code: string;
            bust: string | null;
            waist: string | null;
            hips: string | null;
            length: string | null;
            is_available: boolean;
        }>;
        images: Array<{
            id: number;
            path: string;
            thumbnail: string | null;
            is_primary: boolean;
            alt_text: string | null;
        }>;
    };
}

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
    return (
        <label htmlFor={htmlFor} className="mb-1.5 block text-xs uppercase tracking-luxe text-stone-muted">
            {children}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    return message ? <p className="mt-1.5 text-xs text-danger">{message}</p> : null;
}

function validateStep(step: number, data: DressFormData): DressFormErrors {
    if (step === 0) {
        const errors: DressFormErrors = {};
        if (!data.title.trim()) {
            errors.title = 'Title is required.';
        }
        if (!data.category_id) {
            errors.category_id = 'Please choose a category.';
        }

        return errors;
    }

    if (step === 1) {
        const errors: DressFormErrors = {};
        if (!data.rental_price_per_day.trim() || Number(data.rental_price_per_day) < 1) {
            errors.rental_price_per_day = 'Rental price per day must be at least 1.';
        }

        return errors;
    }

    if (step === 2) {
        const errors: DressFormErrors = {};
        if (data.sizes.length === 0) {
            errors.sizes = 'Add at least one size row.';
        } else if (data.sizes.filter((row) => row.size_code).length === 0) {
            errors.sizes = 'Choose a size code for at least one row.';
        }

        return errors;
    }

    return {};
}

export function DressCreateEdit({ mode, atelier, categories, dress }: DressCreateEditProps) {
    const [step, setStep] = useState(0);
    const [stepErrors, setStepErrors] = useState<DressFormErrors>({});
    const [previews, setPreviews] = useState<ImagePreview[]>([]);
    const [mediaError, setMediaError] = useState<string | null>(null);

    const form = useForm<DressFormData>({
        title: dress?.title ?? '',
        category_id: dress ? String(dress.category_id) : '',
        description: dress?.description ?? '',
        fabric_type: dress?.fabric_type ?? '',
        silhouette: dress?.silhouette ?? '',
        color_primary: dress?.color_primary ?? '',
        condition_rating: dress?.condition_rating ?? 'good',
        turnaround_buffer_days: dress ? String(dress.turnaround_buffer_days) : '3',
        rental_price_per_day: dress?.rental_price_per_day ?? '',
        security_deposit_amount: dress?.security_deposit_amount ?? '',
        cleaning_fee: dress?.cleaning_fee ?? '',
        late_fee_per_day: dress?.late_fee_per_day ?? '',
        original_retail_value: dress?.original_retail_value ?? '',
        sizes:
            dress && dress.sizes.length > 0
                ? dress.sizes.map((size) => ({
                      size_code: size.size_code,
                      bust: size.bust ?? '',
                      waist: size.waist ?? '',
                      hips: size.hips ?? '',
                      length: size.length ?? '',
                      is_available: size.is_available,
                  }))
                : [{ size_code: '', bust: '', waist: '', hips: '', length: '', is_available: true }],
        images: [],
    });

    const handleContinue = (): void => {
        const errors = validateStep(step, form.data);
        setStepErrors(errors);
        if (Object.keys(errors).length === 0) {
            setStep((current) => Math.min(STEPS.length - 1, current + 1));
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            category_id: data.category_id ? Number(data.category_id) : null,
            turnaround_buffer_days:
                data.turnaround_buffer_days.trim() !== '' ? Number(data.turnaround_buffer_days) : null,
            sizes: data.sizes
                .filter((row) => row.size_code)
                .map((row) => ({
                    size_code: row.size_code,
                    bust: row.bust.trim() !== '' ? Number(row.bust) : null,
                    waist: row.waist.trim() !== '' ? Number(row.waist) : null,
                    hips: row.hips.trim() !== '' ? Number(row.hips) : null,
                    length: row.length.trim() !== '' ? Number(row.length) : null,
                    is_available: row.is_available,
                })),
        }));

        if (mode === 'create') {
            form.post(`/atelier/${atelier.id}/dresses`);
        } else if (dress) {
            form.put(`/atelier/${atelier.id}/dresses/${dress.id}`);
        }
    };

    const handleFiles = (event: ChangeEvent<HTMLInputElement>): void => {
        const files = Array.from(event.target.files ?? []);
        const rejected = files.filter((file) => !ALLOWED_MIME.includes(file.type));
        const accepted = files.filter((file) => ALLOWED_MIME.includes(file.type));

        if (rejected.length > 0) {
            setMediaError(
                `${rejected.length} ${rejected.length === 1 ? 'file was' : 'files were'} skipped — only JPEG, PNG and WebP are supported.`,
            );
        } else {
            setMediaError(null);
        }

        if (accepted.length > 0) {
            const added = accepted.map((file) => ({
                id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
                file,
                url: URL.createObjectURL(file),
            }));
            const next = [...previews, ...added];
            setPreviews(next);
            form.setData('images', next.map((preview) => preview.file));
            event.target.value = '';
        }
    };

    const removePreview = (id: string): void => {
        const target = previews.find((preview) => preview.id === id);
        if (target) {
            URL.revokeObjectURL(target.url);
        }
        const next = previews.filter((preview) => preview.id !== id);
        setPreviews(next);
        form.setData('images', next.map((preview) => preview.file));
    };

    const makePrimary = (id: string): void => {
        const index = previews.findIndex((preview) => preview.id === id);
        if (index <= 0) {
            return;
        }
        const next = [previews[index], ...previews.filter((preview) => preview.id !== id)];
        setPreviews(next);
        form.setData('images', next.map((preview) => preview.file));
    };

    const addSizeRow = (): void => {
        const used = new Set(form.data.sizes.map((row) => row.size_code).filter(Boolean));
        const nextCode = SIZE_CODES.find((code) => !used.has(code)) ?? '';
        form.setData('sizes', [
            ...form.data.sizes,
            { size_code: nextCode, bust: '', waist: '', hips: '', length: '', is_available: true },
        ]);
    };

    const removeSizeRow = (index: number): void => {
        form.setData(
            'sizes',
            form.data.sizes.filter((_, rowIndex) => rowIndex !== index),
        );
    };

    const updateSizeRow = <K extends keyof SizeRow>(index: number, key: K, value: SizeRow[K]): void => {
        form.setData(
            'sizes',
            form.data.sizes.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
        );
    };

    const pricePerDay = Number(form.data.rental_price_per_day);
    const quoteSubtotal = Number.isFinite(pricePerDay) && pricePerDay > 0 ? pricePerDay * QUOTE_DAYS : 0;

    return (
        <div className="mx-auto max-w-3xl">
            <header className="py-8">
                <h1 className="font-display text-3xl text-charcoal">
                    {mode === 'create' ? 'Add a new dress' : 'Edit dress'}
                </h1>
                <p className="mt-1 text-sm text-stone-muted">{atelier.business_name}</p>
            </header>

            <div className="sticky top-0 z-20 border-b border-stone-line bg-ivory/95 backdrop-blur">
                <ol className="flex items-center gap-4 overflow-x-auto py-4" aria-label="Dress form steps">
                    {STEPS.map((item, index) => {
                        const done = index < step;
                        const current = index === step;

                        return (
                            <li key={item.key} className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => (index < step ? setStep(index) : undefined)}
                                    aria-current={current ? 'step' : undefined}
                                    aria-label={`${item.label}${done ? ' (completed)' : ''}`}
                                    className={cn(
                                        'flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                        current || done ? '' : 'text-stone-muted',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors',
                                            done
                                                ? 'border-champagne bg-champagne text-charcoal'
                                                : current
                                                  ? 'border-charcoal bg-charcoal text-white'
                                                  : 'border-stone-line bg-white text-stone-muted',
                                        )}
                                    >
                                        {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                                    </span>
                                    <span className="whitespace-nowrap text-xs uppercase tracking-luxe">
                                        {item.label}
                                    </span>
                                </button>
                                {index < STEPS.length - 1 ? (
                                    <span className="h-px w-6 bg-stone-line" aria-hidden="true" />
                                ) : null}
                            </li>
                        );
                    })}
                </ol>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-8 pb-16">
                {form.hasErrors ? (
                    <Alert
                        tone="danger"
                        title="Please correct the highlighted fields."
                        dismissible
                        onDismiss={() => form.clearErrors()}
                    />
                ) : null}

                {step === 0 ? (
                    <section aria-label="Basic information" className="space-y-5">
                        <div className="space-y-2">
                            <FieldLabel htmlFor="title">Title</FieldLabel>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(event) => form.setData('title', event.target.value)}
                                placeholder="Evening gown in blush silk"
                            />
                            <FieldError message={stepErrors.title ?? form.errors.title} />
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <FieldLabel htmlFor="category_id">Category</FieldLabel>
                                <Select
                                    id="category_id"
                                    value={form.data.category_id}
                                    onChange={(event) => form.setData('category_id', event.target.value)}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                                <FieldError message={stepErrors.category_id ?? form.errors.category_id} />
                            </div>

                            <div className="space-y-2">
                                <FieldLabel htmlFor="condition_rating">Condition</FieldLabel>
                                <Select
                                    id="condition_rating"
                                    value={form.data.condition_rating}
                                    onChange={(event) => form.setData('condition_rating', event.target.value)}
                                >
                                    {CONDITION_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                                <FieldError message={stepErrors.condition_rating ?? form.errors.condition_rating} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <FieldLabel htmlFor="description">Description</FieldLabel>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                                placeholder="Cut, occasion, styling notes, care — anything that helps a renter decide."
                                className="min-h-[120px]"
                            />
                            <FieldError message={stepErrors.description ?? form.errors.description} />
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <div className="space-y-2">
                                <FieldLabel htmlFor="fabric_type">Fabric</FieldLabel>
                                <Input
                                    id="fabric_type"
                                    value={form.data.fabric_type}
                                    onChange={(event) => form.setData('fabric_type', event.target.value)}
                                    placeholder="Silk"
                                />
                                <FieldError message={stepErrors.fabric_type ?? form.errors.fabric_type} />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="silhouette">Silhouette</FieldLabel>
                                <Input
                                    id="silhouette"
                                    value={form.data.silhouette}
                                    onChange={(event) => form.setData('silhouette', event.target.value)}
                                    placeholder="A-line"
                                />
                                <FieldError message={stepErrors.silhouette ?? form.errors.silhouette} />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="color_primary">Primary colour</FieldLabel>
                                <Input
                                    id="color_primary"
                                    value={form.data.color_primary}
                                    onChange={(event) => form.setData('color_primary', event.target.value)}
                                    placeholder="Blush"
                                />
                                <FieldError message={stepErrors.color_primary ?? form.errors.color_primary} />
                            </div>
                        </div>

                        <div className="max-w-[160px] space-y-2">
                            <FieldLabel htmlFor="turnaround_buffer_days">Turnaround buffer (days)</FieldLabel>
                            <Input
                                id="turnaround_buffer_days"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={14}
                                value={form.data.turnaround_buffer_days}
                                onChange={(event) =>
                                    form.setData('turnaround_buffer_days', event.target.value)
                                }
                            />
                            <FieldError
                                message={stepErrors.turnaround_buffer_days ?? form.errors.turnaround_buffer_days}
                            />
                        </div>
                    </section>
                ) : null}

                {step === 1 ? (
                    <section aria-label="Pricing and deposit" className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <FieldLabel htmlFor="rental_price_per_day">Rental price per day</FieldLabel>
                                <Input
                                    id="rental_price_per_day"
                                    type="number"
                                    inputMode="decimal"
                                    min={1}
                                    step="0.01"
                                    value={form.data.rental_price_per_day}
                                    onChange={(event) => form.setData('rental_price_per_day', event.target.value)}
                                    placeholder="0.00"
                                />
                                <FieldError
                                    message={stepErrors.rental_price_per_day ?? form.errors.rental_price_per_day}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="security_deposit_amount">Security deposit</FieldLabel>
                                <Input
                                    id="security_deposit_amount"
                                    type="number"
                                    inputMode="decimal"
                                    min={0}
                                    step="0.01"
                                    value={form.data.security_deposit_amount}
                                    onChange={(event) =>
                                        form.setData('security_deposit_amount', event.target.value)
                                    }
                                    placeholder="0.00"
                                />
                                <FieldError
                                    message={
                                        stepErrors.security_deposit_amount ?? form.errors.security_deposit_amount
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="cleaning_fee">Cleaning fee</FieldLabel>
                                <Input
                                    id="cleaning_fee"
                                    type="number"
                                    inputMode="decimal"
                                    min={0}
                                    step="0.01"
                                    value={form.data.cleaning_fee}
                                    onChange={(event) => form.setData('cleaning_fee', event.target.value)}
                                    placeholder="0.00"
                                />
                                <FieldError message={stepErrors.cleaning_fee ?? form.errors.cleaning_fee} />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="late_fee_per_day">Late fee per day</FieldLabel>
                                <Input
                                    id="late_fee_per_day"
                                    type="number"
                                    inputMode="decimal"
                                    min={0}
                                    step="0.01"
                                    value={form.data.late_fee_per_day}
                                    onChange={(event) => form.setData('late_fee_per_day', event.target.value)}
                                    placeholder="0.00"
                                />
                                <FieldError
                                    message={stepErrors.late_fee_per_day ?? form.errors.late_fee_per_day}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="original_retail_value">Original retail value</FieldLabel>
                                <Input
                                    id="original_retail_value"
                                    type="number"
                                    inputMode="decimal"
                                    min={0}
                                    step="0.01"
                                    value={form.data.original_retail_value}
                                    onChange={(event) =>
                                        form.setData('original_retail_value', event.target.value)
                                    }
                                    placeholder="0.00"
                                />
                                <FieldError
                                    message={stepErrors.original_retail_value ?? form.errors.original_retail_value}
                                />
                            </div>
                        </div>

                        <div className="border border-stone-line bg-ivory p-5">
                            <p className="text-xs uppercase tracking-luxe text-stone-muted">
                                {QUOTE_DAYS}-day rental preview
                            </p>
                            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
                                <span className="text-sm text-stone-muted">
                                    {QUOTE_DAYS} days ×{' '}
                                    {formatCurrency(form.data.rental_price_per_day || 0, PREVIEW_CURRENCY)}
                                </span>
                                <span className="font-display text-2xl text-charcoal">
                                    {formatCurrency(quoteSubtotal, PREVIEW_CURRENCY)}
                                </span>
                            </div>
                        </div>
                    </section>
                ) : null}

                {step === 2 ? (
                    <section aria-label="Dimensions and sizes" className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-luxe text-stone-muted">Size chart</p>
                                <p className="mt-1 text-sm text-stone-muted">
                                    Measurements are entered in centimetres (cm).
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addSizeRow}
                                disabled={form.data.sizes.length >= 7}
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Add size
                            </Button>
                        </div>

                        <FieldError message={stepErrors.sizes ?? form.errors.sizes} />

                        <div className="space-y-4">
                            {form.data.sizes.map((row, index) => (
                                <div key={`${index}-${row.size_code}`} className="border border-stone-line bg-white p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs uppercase tracking-luxe text-stone-muted">
                                            Size {index + 1}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => removeSizeRow(index)}
                                            aria-label={`Remove size ${row.size_code || index + 1}`}
                                            className="rounded-none p-1 text-stone-muted transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                                        >
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        <div className="col-span-2 sm:col-span-4">
                                            <Select
                                                value={row.size_code}
                                                onChange={(event) =>
                                                    updateSizeRow(index, 'size_code', event.target.value)
                                                }
                                                aria-label={`Size code ${index + 1}`}
                                            >
                                                <option value="">Select size</option>
                                                {SIZE_CODES.map((code) => {
                                                    const usedElsewhere = form.data.sizes.some(
                                                        (other, otherIndex) =>
                                                            otherIndex !== index && other.size_code === code,
                                                    );

                                                    return (
                                                        <option key={code} value={code} disabled={usedElsewhere}>
                                                            {code}
                                                        </option>
                                                    );
                                                })}
                                            </Select>
                                        </div>
                                        <Input
                                            value={row.bust}
                                            onChange={(event) => updateSizeRow(index, 'bust', event.target.value)}
                                            placeholder="Bust"
                                            inputMode="decimal"
                                            aria-label={`Bust ${index + 1}`}
                                        />
                                        <Input
                                            value={row.waist}
                                            onChange={(event) => updateSizeRow(index, 'waist', event.target.value)}
                                            placeholder="Waist"
                                            inputMode="decimal"
                                            aria-label={`Waist ${index + 1}`}
                                        />
                                        <Input
                                            value={row.hips}
                                            onChange={(event) => updateSizeRow(index, 'hips', event.target.value)}
                                            placeholder="Hips"
                                            inputMode="decimal"
                                            aria-label={`Hips ${index + 1}`}
                                        />
                                        <Input
                                            value={row.length}
                                            onChange={(event) => updateSizeRow(index, 'length', event.target.value)}
                                            placeholder="Length"
                                            inputMode="decimal"
                                            aria-label={`Length ${index + 1}`}
                                        />
                                    </div>

                                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-charcoal">
                                        <input
                                            type="checkbox"
                                            checked={row.is_available}
                                            onChange={(event) =>
                                                updateSizeRow(index, 'is_available', event.target.checked)
                                            }
                                            className="h-4 w-4 rounded-none border-stone-line text-champagne focus-visible:ring-rose"
                                        />
                                        Available to rent
                                    </label>
                                </div>
                            ))}
                        </div>

                        {form.data.sizes.length >= 7 ? (
                            <p className="text-xs text-stone-muted">You can add up to 7 sizes.</p>
                        ) : null}
                    </section>
                ) : null}

                {step === 3 ? (
                    <section aria-label="Media and sorting" className="space-y-8">
                        {mode === 'edit' && dress && dress.images.length > 0 ? (
                            <div>
                                <p className="text-xs uppercase tracking-luxe text-stone-muted">Current photos</p>
                                <p className="mt-1 text-sm text-stone-muted">
                                    Existing photos are read-only. New uploads are appended and the first new
                                    photo becomes the primary image.
                                </p>
                                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                                    {dress.images.map((image) => (
                                        <div
                                            key={image.id}
                                            className="relative aspect-[3/4] overflow-hidden border border-stone-line"
                                        >
                                            <img
                                                src={image.path}
                                                alt={image.alt_text ?? dress.title}
                                                className="h-full w-full object-cover"
                                            />
                                            {image.is_primary ? (
                                                <span className="absolute left-2 top-2 bg-charcoal/80 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                                                    Primary
                                                </span>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div>
                            <p className="text-xs uppercase tracking-luxe text-stone-muted">Add photos</p>
                            <p className="mt-1 text-sm text-stone-muted">
                                JPEG, PNG or WebP — up to 12 files. The first photo is the primary image.
                            </p>
                            <label htmlFor="dress-images" className="mt-4 block cursor-pointer">
                                <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-stone-line bg-ivory/50 px-6 py-10 text-center transition-colors hover:border-champagne">
                                    <ImagePlus className="h-6 w-6 text-champagne" aria-hidden="true" />
                                    <span className="text-sm font-medium text-charcoal">Choose photos</span>
                                </div>
                            </label>
                            <Input
                                id="dress-images"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFiles}
                            />
                        </div>

                        {mediaError ? (
                            <Alert tone="danger" dismissible onDismiss={() => setMediaError(null)}>
                                {mediaError}
                            </Alert>
                        ) : null}

                        {previews.length > 0 ? (
                            <div>
                                <p className="text-xs uppercase tracking-luxe text-stone-muted">New photos</p>
                                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                                    {previews.map((preview, index) => (
                                        <div
                                            key={preview.id}
                                            className="group relative aspect-[3/4] overflow-hidden border border-stone-line"
                                        >
                                            <img
                                                src={preview.url}
                                                alt={`New photo ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                            {index === 0 ? (
                                                <span className="absolute left-2 top-2 bg-champagne px-2 py-0.5 text-[10px] uppercase tracking-wider text-charcoal">
                                                    Primary
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => makePrimary(preview.id)}
                                                    aria-label={`Set photo ${index + 1} as primary`}
                                                    className="absolute left-2 top-2 bg-white/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-charcoal opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                                                >
                                                    Set primary
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removePreview(preview.id)}
                                                aria-label={`Remove photo ${index + 1}`}
                                                className="absolute right-2 top-2 rounded-full bg-charcoal/80 p-1.5 text-white transition-colors hover:bg-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </section>
                ) : null}

                {form.progress ? (
                    <div
                        className="h-1 w-full overflow-hidden bg-stone-line"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={form.progress.percentage}
                    >
                        <div
                            className="h-full bg-champagne transition-all"
                            style={{ width: `${form.progress.percentage}%` }}
                        />
                    </div>
                ) : null}

                <div className="flex items-center justify-between border-t border-stone-line pt-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep((current) => Math.max(0, current - 1))}
                        disabled={step === 0 || form.processing}
                    >
                        Back
                    </Button>
                    {step < STEPS.length - 1 ? (
                        <Button type="button" onClick={handleContinue} disabled={form.processing}>
                            Continue
                        </Button>
                    ) : (
                        <Button type="submit" variant="champagne" disabled={form.processing}>
                            {mode === 'create' ? 'Create dress' : 'Save changes'}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
