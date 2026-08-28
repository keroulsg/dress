/**
 * Review module — public surface.
 */

import { Star } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';

export interface RatingInputProps {
    value: number;
    onChange: (rating: number) => void;
    max?: number;
    readOnly?: boolean;
}

/** Star rating input (keyboard-accessible). */
export function RatingInput({ value, onChange, max = 5, readOnly = false }: RatingInputProps) {
    const [hovered, setHovered] = React.useState<number | null>(null);
    const display = hovered ?? value;

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (readOnly) {
            return;
        }

        const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;

        if (delta !== 0) {
            event.preventDefault();
            onChange(Math.min(max, Math.max(1, value + delta)));
        }
    };

    return (
        <div
            role="radiogroup"
            aria-label="Rating"
            aria-valuemin={1}
            aria-valuemax={max}
            aria-valuenow={value}
            tabIndex={readOnly ? -1 : 0}
            onKeyDown={handleKeyDown}
            className="inline-flex items-center gap-1"
        >
            {Array.from({ length: max }).map((_, index) => {
                const star = index + 1;

                return (
                    <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={value === star}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        disabled={readOnly}
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(null)}
                        className="rounded-none p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose disabled:cursor-default"
                    >
                        <Star
                            className={cn(
                                'h-6 w-6 transition-colors',
                                star <= display ? 'fill-champagne text-champagne' : 'text-stone-line',
                            )}
                            aria-hidden="true"
                        />
                    </button>
                );
            })}
        </div>
    );
}

export interface ReviewCardProps {
    author: string;
    rating: number;
    comment?: string | null;
    atelierReply?: string | null;
}

/** Editorial review card with optional atelier reply. */
export function ReviewCard({ author, rating, comment, atelierReply }: ReviewCardProps) {
    return (
        <article className="border border-stone-line bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-charcoal">{author}</p>
                <RatingInput value={rating} onChange={() => {}} readOnly />
            </div>
            {comment ? <p className="mt-3 text-sm leading-relaxed text-stone-muted">{comment}</p> : null}
            {atelierReply ? (
                <div className="mt-4 border-l-2 border-champagne pl-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-muted">Atelier reply</p>
                    <p className="mt-1 text-sm text-charcoal">{atelierReply}</p>
                </div>
            ) : null}
        </article>
    );
}