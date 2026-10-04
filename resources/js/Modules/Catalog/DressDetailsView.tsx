import { Link } from '@inertiajs/react';
import { Heart, ShieldCheck, Star } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../Components/UI/Badge';
import { Button } from '../../Components/UI/Button';
import { useLanguage } from '../../Contexts/LanguageContext';
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
        original_retail_value?: { amount: string; currency: string };
        rental_price_per_day: { amount: string; currency: string };
        security_deposit_amount?: { amount: string; currency: string };
        cleaning_fee?: { amount: string; currency: string };
        late_fee_per_day?: { amount: string; currency: string };
        turnaround_buffer_days?: number;
        condition_rating: string;
        status: string;
        images?: ImageGalleryImage[];
        sizes?: SizeGuideSize[];
        atelier?: {
            business_name: string;
            city: string | null;
            rating_average: string | null;
            is_approved: boolean;
        };
        review_summary?: { count: number; average: string | null };
    };
}

export function DressDetailsView({ dress }: DressDetailsViewProps) {
    const { tr } = useLanguage();
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

    const sizes = dress.sizes ?? [];
    const images = dress.images ?? [];
    const atelier = dress.atelier ?? { business_name: 'Maison Rentale', city: null, rating_average: null, is_approved: true };
    const reviewSummary = dress.review_summary ?? { count: 0, average: null };

    const status = dressStatus[dress.status] ?? dressStatus.active;
    const availableSizes = sizes.filter((size) => size.is_available);
    const [selectedSize, setSelectedSize] = useState<string | null>(
        availableSizes[0]?.size_code ?? null,
    );

    const rentalRate = dress.rental_price_per_day?.amount || '0';
    const currency = dress.rental_price_per_day?.currency || 'EGP';
    const depositAmount = dress.security_deposit_amount?.amount
        ? dress.security_deposit_amount.amount
        : (parseFloat(rentalRate) * 0.25).toFixed(2);
    const cleaningAmount = dress.cleaning_fee?.amount || '50.00';
    const lateFeeAmount = dress.late_fee_per_day?.amount || '100.00';

    const specs = [
        { label: tr('نوع القماش', 'Fabric'), value: dress.fabric_type },
        { label: tr('القصة والتصميم', 'Silhouette'), value: dress.silhouette },
        { label: tr('اللون الأساسي', 'Colour'), value: dress.color_primary },
        { label: tr('حالة الفستان', 'Condition'), value: dressConditionLabel(dress.condition_rating) },
    ];

    return (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
                <ImageGallery images={images} title={dress.title} />
            </div>

            <div className="lg:col-span-5">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Badge tone={dressStatusTone(dress.status)}>{status.label}</Badge>
                        <h1 className="font-display text-3xl leading-tight text-charcoal sm:text-4xl">
                            {dress.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-muted">
                            <span className="font-medium text-charcoal">{atelier.business_name}</span>
                            {atelier.is_approved ? (
                                <span className="inline-flex items-center gap-1 text-xs text-success">
                                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                                    {tr('أتيليه معتمد', 'Verified Atelier')}
                                </span>
                            ) : null}
                            {atelier.city ? (
                                <>
                                    <span aria-hidden="true">·</span>
                                    <span>{atelier.city}</span>
                                </>
                            ) : null}
                        </div>
                        {reviewSummary.count > 0 ? (
                            <p className="flex items-center gap-1.5 text-sm text-stone-muted">
                                <Star className="h-4 w-4 fill-champagne text-champagne" aria-hidden="true" />
                                <span className="font-medium text-charcoal">
                                    {reviewSummary.average ?? '—'} / 10
                                </span>
                                <span>
                                    ({reviewSummary.count}{' '}
                                    {reviewSummary.count === 1 ? tr('تقييم', 'review') : tr('تقييمات', 'reviews')})
                                </span>
                            </p>
                        ) : (
                            <p className="text-sm text-stone-muted">{tr('لا توجد تقييمات بعد', 'No reviews yet')}</p>
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
                                    rentalRate,
                                    currency,
                                )}
                            </p>
                            <p className="text-sm text-stone-muted">{tr('لكل يوم / مناسبة', 'per day / event')}</p>
                        </div>
                        <dl className="space-y-1.5 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-stone-muted">{tr('مبلغ التأمين المسترد (25%)', 'Refundable Security Deposit (25%)')}</dt>
                                <dd className="font-medium text-charcoal">
                                    {formatCurrency(
                                        depositAmount,
                                        currency,
                                    )}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-stone-muted">{tr('رسوم التجهيز والتنظيف', 'Mandatory Cleaning & Prep')}</dt>
                                <dd className="font-medium text-charcoal">
                                    {formatCurrency(cleaningAmount, currency)}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-stone-muted">{tr('غرامة التأخير اليومية', 'Late Fee Per Day')}</dt>
                                <dd className="font-medium text-charcoal">
                                    {formatCurrency(lateFeeAmount, currency)}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-luxe text-stone-muted">{tr('اختاري المقاس', 'Select size')}</p>
                            <button
                                type="button"
                                onClick={() => setSizeGuideOpen(true)}
                                className="text-sm text-rose underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                            >
                                {tr('دليل المقاسات', 'Size guide')}
                            </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {sizes.map((size) => {
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
                            <p className="mt-2 text-xs text-stone-muted">{tr('لا توجد مقاسات متوفرة حالياً.', 'No sizes are available right now.')}</p>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <Button asChild size="lg" className="flex-1 bg-charcoal hover:bg-stone-800 text-white font-serif">
                            <Link href={`/checkout/${dress.id}`}>
                                {tr('احجزي الفستان الآن', 'Check Availability & Reserve')}
                            </Link>
                        </Button>
                        <Button type="button" variant="outline" size="lg" aria-label="Save this dress">
                            <Heart className="h-4 w-4" aria-hidden="true" />
                            {tr('حفظ في المفضلة', 'Save Dress')}
                        </Button>
                    </div>
                </div>
            </div>

            <SizeGuideModal
                open={sizeGuideOpen}
                onOpenChange={setSizeGuideOpen}
                sizes={sizes}
            />
        </div>
    );
}
