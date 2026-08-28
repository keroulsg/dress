import { Heart, ShieldCheck, Star } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../Components/UI/Badge';
import { Button } from '../../Components/UI/Button';
import { formatCurrency } from '../../Lib/currency';
import { dressStatus } from '../../Lib/tokens';
import { cn } from '../../Lib/utils';
import { dressConditionLabel, dressStatusTone } from './DressCard';
import { ImageGallery, type ImageGalleryImage } from './ImageGallery';
import { SizeGuideModal, type SizeGuideSize } from './SizeGuideModal';

export interface DressDetailsViewProps {
    dress: {
        id: number;
        slug: string;
        title: string;
        description: string;
        fabric_type: string;
        silhouette: string;
        color_primary: string;
        original_retail_value: { amount: string; currency: string };
        rental_price_per_day: { amount: string; currency: string };
        security_deposit_amount: { amount: string; currency: string };
        cleaning_fee: { amount: string; currency: string };
        late_fee_per_day: { amount: string; currency: string };
        turnaround_buffer_days: number;
        condition_rating: string;
        status: string;
        images: ImageGalleryImage[];
        sizes: SizeGuideSize[];
        atelier: {
            business_name: string;
            city: string | null;
            rating_average: string | null;
            is_approved: boolean;
        };
        review_summary: { count: number; average: string | null };
    };
}

export function DressDetailsView({ dress }: DressDetailsViewProps) {
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

    const status = dressStatus[dress.status] ?? dressStatus.active;
    const availableSizes = dress.sizes.filter((size) => size.is_available);
    const [selectedSize, setSelectedSize] = useState<string | null>(
        availableSizes[0]?.size_code ?? null,
    );

    const specs = [
        { label: 'Fabric', value: dress.fabric_type },
        { label: 'Silhouette', value: dress.silhouette },
        { label: 'Colour', value: dress.color_primary },
        { label: 'Condition', value: dressConditionLabel(dress.condition_rating) },
    ];

    return (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
                <ImageGallery images={dress.images} title={dress.title} />
            </div>

            <div className="lg:col-span-5">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Badge tone={dressStatusTone(dress.status)}>{status.label}</Badge>
                        <h1 className="font-display text-3xl leading-tight text-charcoal sm:text-4xl">
                            {dress.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-muted">
                            <span className="font-medium text-charcoal">{dress.atelier.business_name}</span>
                            {dress.atelier.is_approved ? (
                                <span className="inline-flex items-center gap-1 text-xs text-success">
                                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                                    Verified
                                </span>
                            ) : null}
                            {dress.atelier.city ? (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <span>{dress.atelier.city}</span>
                                </>
                            ) : null}
                        </div>
                        {dress.review_summary.count > 0 ? (
                            <p className="flex items-center gap-1.5 text-sm text-stone-muted">
                                <Star className="h-4 w-4 fill-champagne text-champagne" aria-hidden="true" />
                                <span className="font-medium text-charcoal">
                                    {dress.review_summary.average ?? '—'} / 10
                                </span>
                                <span>
                                    ({dress.review_summary.count}{' '}
                                    {dress.review_summary.count === 1 ? 'review' : 'reviews'})
                                </span>
                            </p>
                        ) : (
                            <p className="text-sm text-stone-muted">No reviews yet</p>
                        )}
                    </div>

                    <p className="leading-relaxed text-stone-muted">{dress.description}</p>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-stone-line py-5">
                        {specs.map((spec) => (
                            <div key={spec.label}>
                                <p className="text-xs uppercase tracking-luxe text-stone-muted">{spec.label}</p>
                                <p className="mt-1 text-sm text-charcoal">{spec.value || '—'}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2.5 border-b border-stone-line pb-5">
                        <div className="flex items-baseline justify-between gap-3">
                            <p className="font-display text-3xl text-charcoal">
                                {formatCurrency(
                                    dress.rental_price_per_day.amount,
                                    dress.rental_price_per_day.currency,
                                )}
                            </p>
                            <p className="text-sm text-stone-muted">per day</p>
                        </div>
                        <dl className="space-y-1.5 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-stone-muted">Security deposit</dt>
                                <dd className="font-medium text-charcoal">
                                    {formatCurrency(
                                        dress.security_deposit_amount.amount,
                                        dress.security_deposit_amount.currency,
                                    )}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-stone-muted">Cleaning fee</dt>
                                <dd className="font-medium text-charcoal">
                                    {formatCurrency(dress.cleaning_fee.amount, dress.cleaning_fee.currency)}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-stone-muted">Late fee per day</dt>
                                <dd className="font-medium text-charcoal">
                                    {formatCurrency(dress.late_fee_per_day.amount, dress.late_fee_per_day.currency)}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-luxe text-stone-muted">Select size</p>
                            <button
                                type="button"
                                onClick={() => setSizeGuideOpen(true)}
                                className="text-sm text-rose underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                            >
                                Size guide
                            </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {dress.sizes.map((size) => {
                                const active = selectedSize === size.size_code;

                                return (
                                    <button
                                        key={size.size_code}
                                        type="button"
                                        disabled={!size.is_available}
                                        aria-pressed={active}
                                        aria-label={`${size.size_code} — ${size.is_available ? 'available' : 'unavailable'}`}
                                        onClick={() => setSelectedSize(size.size_code)}
                                        className={cn(
                                            'border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                            active
                                                ? 'border-charcoal bg-charcoal text-white'
                                                : 'border-stone-line bg-white text-charcoal hover:border-champagne',
                                            !size.is_available &&
                                                'cursor-not-allowed text-stone-muted opacity-50 line-through hover:border-stone-line',
                                        )}
                                    >
                                        {size.size_code}
                                    </button>
                                );
                            })}
                        </div>
                        {availableSizes.length === 0 ? (
                            <p className="mt-2 text-xs text-stone-muted">No sizes are available right now.</p>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <Button type="button" size="lg" className="flex-1">
                            Check availability
                        </Button>
                        <Button type="button" variant="outline" size="lg" aria-label="Save this dress">
                            <Heart className="h-4 w-4" aria-hidden="true" />
                            Save dress
                        </Button>
                    </div>
                </div>
            </div>

            <SizeGuideModal
                open={sizeGuideOpen}
                onOpenChange={setSizeGuideOpen}
                sizes={dress.sizes}
            />
        </div>
    );
}
