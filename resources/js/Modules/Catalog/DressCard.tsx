import { Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';

import { Badge, type BadgeTone } from '../../Components/UI/Badge';
import { formatCurrency } from '../../Lib/currency';
import { dressStatus, statusColors } from '../../Lib/tokens';
import { cn } from '../../Lib/utils';

export interface DressCardDress {
    id: number;
    slug: string;
    title: string;
    atelier_id: number;
    atelier_name: string;
    category_name: string;
    rental_price_per_day: { amount: string; currency: string };
    security_deposit_amount: { amount: string; currency: string };
    primary_image_path: string | null;
    thumbnail_path: string | null;
    status: string;
    condition_rating: string;
    available_sizes: string[];
}

export interface DressCardProps {
    dress: DressCardDress;
    href?: string;
    onToggleFavorite?: (dressId: number) => void;
    favorited?: boolean;
    imageOnly?: boolean;
}

const CONDITION_LABELS: Record<string, string> = {
    brand_new: 'Brand new',
    like_new: 'Like new',
    good: 'Good',
    minor_flaws: 'Minor flaws',
};

const TONE_BY_COLOR: Record<string, BadgeTone> = {
    [statusColors.success]: 'success',
    [statusColors.warning]: 'warning',
    [statusColors.danger]: 'danger',
    [statusColors.info]: 'info',
    [statusColors.stone]: 'neutral',
};

export function dressStatusTone(status: string): BadgeTone {
    const color = dressStatus[status]?.color;

    return (color && TONE_BY_COLOR[color]) || 'neutral';
}

export function dressConditionLabel(condition: string): string {
    return CONDITION_LABELS[condition] ?? condition;
}

function DressImage({ dress }: { dress: DressCardDress }) {
    const src = dress.primary_image_path ?? dress.thumbnail_path;

    return (
        <div className="aspect-[3/4] overflow-hidden bg-stone-line/40">
            {src ? (
                <img
                    src={src}
                    alt={dress.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-lg text-stone-muted">
                    Maison Rentale
                </div>
            )}
        </div>
    );
}

export function DressCard({
    dress,
    href,
    onToggleFavorite,
    favorited = false,
    imageOnly = false,
}: DressCardProps) {
    const target = href ?? `/dresses/${dress.slug}`;
    const status = dressStatus[dress.status] ?? dressStatus.active;

    return (
        <article className="group relative flex flex-col border border-stone-line bg-white">
            <div className="relative">
                <Link href={target} className="block">
                    <DressImage dress={dress} />
                </Link>
                {onToggleFavorite ? (
                    <button
                        type="button"
                        aria-label={favorited ? `Remove ${dress.title} from saved dresses` : `Save ${dress.title}`}
                        aria-pressed={favorited}
                        onClick={() => onToggleFavorite(dress.id)}
                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-stone-muted shadow-subtle transition-colors hover:text-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                    >
                        <Heart
                            className={cn('h-4 w-4', favorited && 'fill-rose text-rose')}
                            aria-hidden="true"
                        />
                    </button>
                ) : null}
            </div>

            {imageOnly ? null : (
                <div className="flex flex-1 flex-col gap-1.5 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-xs uppercase tracking-luxe text-stone-muted">{dress.atelier_name}</p>
                        <Badge tone={dressStatusTone(dress.status)}>{status.label}</Badge>
                    </div>
                    <Link
                        href={target}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                    >
                        <h3 className="font-display text-2xl leading-snug text-charcoal transition-colors group-hover:text-rose">
                            {dress.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-stone-muted">{dress.category_name}</p>
                    {dress.available_sizes.length > 0 ? (
                        <p className="text-xs uppercase tracking-wider text-stone-muted">
                            Sizes: {dress.available_sizes.join(' · ')}
                        </p>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                        <p className="font-display text-xl text-charcoal">
                            {formatCurrency(dress.rental_price_per_day.amount, dress.rental_price_per_day.currency)}
                            <span className="ml-1 font-sans text-xs font-normal text-stone-muted">/ day</span>
                        </p>
                        <Badge tone="champagne">{dressConditionLabel(dress.condition_rating)}</Badge>
                    </div>
                </div>
            )}
        </article>
    );
}
