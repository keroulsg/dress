import { useMemo, useState } from 'react';

import { HighResGalleryModal } from '../../Modules/Media';
import { cn } from '../../Lib/utils';

export interface ImageGalleryImage {
    id: number;
    path: string;
    thumbnail: string | null;
    alt: string | null;
    is_primary: boolean;
    display_order: number;
}

export interface ImageGalleryProps {
    images: ImageGalleryImage[];
    title?: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomed, setZoomed] = useState(false);

    const ordered = useMemo(() => [...images].sort((a, b) => a.display_order - b.display_order), [images]);
    const active = ordered.length > 0 ? ordered[Math.min(activeIndex, ordered.length - 1)] : undefined;

    const gallery = useMemo(
        () =>
            ordered.map((image, index) => ({
                src: image.path,
                alt: image.alt ?? `${title ?? 'Dress'} — photo ${index + 1}`,
            })),
        [ordered, title],
    );

    return (
        <div className="space-y-3">
            <button
                type="button"
                disabled={ordered.length === 0}
                onClick={() => setZoomed(true)}
                aria-label={active ? `Zoom into ${active.alt ?? title ?? 'dress'} photo` : 'No photos available'}
                className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose disabled:cursor-default"
            >
                <div className="aspect-[3/4] overflow-hidden border border-stone-line bg-ivory">
                    {active ? (
                        <img
                            src={active.path}
                            alt={active.alt ?? title ?? 'Dress'}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-2xl text-stone-muted">
                            Maison Rentale
                        </div>
                    )}
                </div>
            </button>

            {ordered.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1" role="region" aria-label="Photo thumbnails">
                    {ordered.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Show ${image.alt ?? `${title ?? 'dress'} photo ${index + 1}`}`}
                            aria-pressed={index === activeIndex}
                            className={cn(
                                'relative aspect-[3/4] w-16 shrink-0 overflow-hidden border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                index === activeIndex
                                    ? 'border-champagne ring-1 ring-champagne'
                                    : 'border-stone-line opacity-70 hover:opacity-100',
                            )}
                        >
                            <img
                                src={image.thumbnail ?? image.path}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            ) : null}

            <HighResGalleryModal
                images={gallery}
                open={zoomed}
                onOpenChange={setZoomed}
                initialIndex={Math.min(activeIndex, Math.max(0, ordered.length - 1))}
            />
        </div>
    );
}
