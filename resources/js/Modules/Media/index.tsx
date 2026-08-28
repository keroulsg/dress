/**
 * Media module — public surface.
 */

import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import * as React from 'react';

import { Modal, ModalContent, ModalTitle } from '../../Components/UI/Modal';

export interface GalleryImage {
    src: string;
    alt: string;
}

export interface HighResGalleryModalProps {
    images: GalleryImage[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialIndex?: number;
}

/** Fullscreen editorial gallery with keyboard navigation. */
export function HighResGalleryModal({ images, open, onOpenChange, initialIndex = 0 }: HighResGalleryModalProps) {
    const [index, setIndex] = React.useState(initialIndex);

    React.useEffect(() => {
        setIndex(initialIndex);
    }, [initialIndex, open]);

    const go = (delta: number): void => {
        setIndex((current) => (current + delta + images.length) % images.length);
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="max-w-4xl bg-ivory" showCloseButton>
                <ModalTitle className="sr-only">Dress gallery</ModalTitle>
                <div
                    className="flex items-center gap-4"
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowLeft') {
                            go(-1);
                        } else if (event.key === 'ArrowRight') {
                            go(1);
                        }
                    }}
                >
                    <button
                        type="button"
                        aria-label="Previous image"
                        onClick={() => go(-1)}
                        className="rounded-none p-2 text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                    >
                        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <figure className="min-w-0 flex-1">
                        {images[index] ? (
                            <img
                                src={images[index].src}
                                alt={images[index].alt}
                                className="max-h-[70vh] w-full object-contain"
                            />
                        ) : null}
                        <figcaption className="mt-3 flex items-center justify-between text-xs text-stone-muted">
                            <span>{images[index]?.alt}</span>
                            <span>
                                {index + 1} / {images.length}
                            </span>
                        </figcaption>
                    </figure>
                    <button
                        type="button"
                        aria-label="Next image"
                        onClick={() => go(1)}
                        className="rounded-none p-2 text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                    >
                        <ChevronRight className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <button
                    type="button"
                    aria-label="Expand"
                    className="absolute bottom-4 right-4 rounded-none p-1 text-stone-muted transition-colors hover:text-charcoal"
                >
                    <Expand className="h-4 w-4" aria-hidden="true" />
                </button>
            </ModalContent>
        </Modal>
    );
}

export function GalleryTrigger({ label = 'Open gallery' }: { label?: string }) {
    return (
        <span className="sr-only">{label}</span>
    );
}