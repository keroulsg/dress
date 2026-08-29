/**
 * Interactive garment schematic for atelier quality control.
 *
 * Click a region in the legend (or on the dress) to set the active location,
 * then click an empty area of the canvas to drop a damage pin at that spot.
 */

import * as React from 'react';

import { cn } from '../../Lib/utils';

export type DamageSeverity = 'minor' | 'moderate' | 'major' | 'critical';

export type GarmentLocation =
    | 'chest'
    | 'waist'
    | 'hem'
    | 'zipper'
    | 'train'
    | 'sleeve'
    | 'bodice'
    | 'lining'
    | 'other';

export interface DamagePin {
    id: string;
    /** chest|waist|hem|zipper|train|sleeve|bodice|lining|other */
    location: string;
    /** Horizontal position as a percentage of the canvas (0-100). */
    x: number;
    /** Vertical position as a percentage of the canvas (0-100). */
    y: number;
    severity: DamageSeverity;
    label?: string;
}

export interface GarmentInspectionCanvasProps {
    pins?: DamagePin[];
    onAddPin?: (pin: Omit<DamagePin, 'id'>) => void;
    onRemovePin?: (id: string) => void;
    readOnly?: boolean;
}

export const GARMENT_LOCATIONS: readonly { value: GarmentLocation; label: string }[] = [
    { value: 'bodice', label: 'Bodice' },
    { value: 'chest', label: 'Chest' },
    { value: 'waist', label: 'Waist' },
    { value: 'hem', label: 'Hem' },
    { value: 'zipper', label: 'Zipper' },
    { value: 'sleeve', label: 'Sleeves' },
    { value: 'train', label: 'Train' },
    { value: 'lining', label: 'Lining' },
    { value: 'other', label: 'Other' },
];

const SEVERITY_DOT: Record<DamageSeverity, string> = {
    minor: 'bg-champagne',
    moderate: 'bg-warning',
    major: 'bg-rose',
    critical: 'bg-rose-deep',
};

const SEVERITY_LABEL: Record<DamageSeverity, string> = {
    minor: 'Minor',
    moderate: 'Moderate',
    major: 'Major',
    critical: 'Critical',
};

interface RegionPathProps {
    id: GarmentLocation;
    d: string;
    title: string;
    active: boolean;
}

function RegionPath({ id, d, title, active }: RegionPathProps) {
    return (
        <path
            data-region={id}
            d={d}
            className={cn(
                'cursor-pointer fill-champagne-light/25 stroke-champagne/50 transition-colors',
                active && 'fill-champagne/50 stroke-champagne',
            )}
        >
            <title>{title}</title>
        </path>
    );
}

const REGION_LABELS: readonly { x: number; y: number; text: string; anchor: 'start' | 'middle' | 'end' }[] = [
    { x: 40, y: 92, text: 'Sleeves', anchor: 'middle' },
    { x: 170, y: 104, text: 'Chest', anchor: 'middle' },
    { x: 186, y: 140, text: 'Zipper', anchor: 'start' },
    { x: 170, y: 176, text: 'Bodice', anchor: 'middle' },
    { x: 170, y: 200, text: 'Waist', anchor: 'middle' },
    { x: 170, y: 476, text: 'Lining', anchor: 'middle' },
    { x: 298, y: 496, text: 'Train', anchor: 'middle' },
    { x: 170, y: 561, text: 'Hem', anchor: 'middle' },
];

const SILHOUETTE_PATH =
    'M 170 28 C 148 32 130 44 120 64 C 104 78 84 90 68 98 C 82 110 104 116 120 120 L 116 192 ' +
    'C 112 238 66 288 52 362 C 40 428 46 492 68 524 C 96 554 134 564 170 564 C 206 564 244 554 272 524 ' +
    'C 294 492 300 428 288 362 C 274 288 228 238 224 192 L 220 120 C 236 116 258 110 272 98 C 256 90 236 78 220 64 ' +
    'C 210 44 192 32 170 28 Z';

/**
 * Editorial gown schematic with severity-coded damage pins. When editable,
 * clicking empty canvas space drops a pin using the active legend location.
 */
export function GarmentInspectionCanvas({
    pins = [],
    onAddPin,
    onRemovePin,
    readOnly = false,
}: GarmentInspectionCanvasProps) {
    const [activeLocation, setActiveLocation] = React.useState<GarmentLocation>('bodice');
    const [selectedPinId, setSelectedPinId] = React.useState<string | null>(null);

    const selectedPin = pins.find((pin) => pin.id === selectedPinId) ?? null;

    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>): void => {
        const target = event.target as Element;
        const regionElement = target.closest('[data-region]');

        if (regionElement) {
            const region = regionElement.getAttribute('data-region') as GarmentLocation | null;
            if (region) {
                setActiveLocation(region);
            }
            return;
        }

        if (readOnly) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        onAddPin?.({ location: activeLocation, x, y, severity: 'minor' });
    };

    const handlePinClick = (event: React.MouseEvent<HTMLButtonElement>, pin: DamagePin): void => {
        event.stopPropagation();

        if (readOnly) {
            setSelectedPinId((current) => (current === pin.id ? null : pin.id));
            return;
        }

        onRemovePin?.(pin.id);
    };

    const locationLabel = (location: string): string =>
        GARMENT_LOCATIONS.find((region) => region.value === location)?.label ?? location;

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div
                className="relative cursor-crosshair select-none border border-stone-line bg-white shadow-subtle"
                onClick={handleCanvasClick}
            >
                <svg
                    viewBox="0 0 340 572"
                    className="block h-auto w-full"
                    role="img"
                    aria-label="Garment schematic with damage pins"
                >
                    <path d={SILHOUETTE_PATH} className="pointer-events-none fill-white stroke-charcoal/25" />

                    <RegionPath id="train" active={activeLocation === 'train'} title="Train"
                        d="M 260 300 C 306 330 326 400 324 500 C 318 540 304 556 288 560 C 300 536 300 500 288 462 C 274 422 262 386 258 350 C 258 332 258 316 260 300 Z" />
                    <RegionPath id="lining" active={activeLocation === 'lining'} title="Lining"
                        d="M 108 420 C 122 448 146 460 170 460 C 194 460 218 448 232 420 C 238 470 234 504 226 522 C 206 538 190 542 170 542 C 150 542 134 538 114 522 C 106 504 102 470 108 420 Z" />
                    <RegionPath id="hem" active={activeLocation === 'hem'} title="Hem"
                        d="M 60 470 C 78 512 106 536 140 544 L 200 544 C 234 536 262 512 280 470 C 284 496 282 522 274 540 C 244 560 210 568 170 568 C 130 568 96 560 66 540 C 58 522 56 496 60 470 Z" />
                    <path
                        d="M 118 190 C 118 235 92 280 78 340 C 66 392 60 430 62 470 C 68 500 82 520 104 534 L 236 534 C 258 520 272 500 278 470 C 280 430 274 392 262 340 C 248 280 222 235 222 190 Z"
                        className="pointer-events-none fill-champagne-light/25 stroke-champagne/50"
                    >
                        <title>Skirt</title>
                    </path>

                    <RegionPath id="bodice" active={activeLocation === 'bodice'} title="Bodice"
                        d="M 128 132 L 212 132 C 219 154 221 170 219 186 L 121 186 C 119 170 121 154 128 132 Z" />
                    <RegionPath id="chest" active={activeLocation === 'chest'} title="Chest"
                        d="M 132 62 C 148 56 192 56 208 62 C 214 90 216 112 212 132 L 128 132 C 124 112 126 90 132 62 Z" />
                    <RegionPath id="waist" active={activeLocation === 'waist'} title="Waist"
                        d="M 121 186 L 219 186 C 221 200 220 208 218 212 L 122 212 C 120 208 119 200 121 186 Z" />
                    <RegionPath id="zipper" active={activeLocation === 'zipper'} title="Zipper"
                        d="M 166 40 L 174 40 L 174 190 L 166 190 Z" />
                    <RegionPath id="sleeve" active={activeLocation === 'sleeve'} title="Sleeves"
                        d="M 118 66 C 98 68 80 80 68 94 C 82 104 102 110 118 114 L 118 66 Z M 222 66 C 242 68 260 80 272 94 C 258 104 238 110 222 114 L 222 66 Z" />

                    {REGION_LABELS.map((label) => (
                        <text
                            key={label.text}
                            x={label.x}
                            y={label.y}
                            textAnchor={label.anchor}
                            className="pointer-events-none select-none fill-stone-muted"
                            style={{ fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.14em' }}
                        >
                            {label.text.toUpperCase()}
                        </text>
                    ))}
                </svg>

                {pins.map((pin) => (
                    <button
                        key={pin.id}
                        type="button"
                        aria-label={`Damage pin — ${locationLabel(pin.location)}, ${SEVERITY_LABEL[pin.severity]}${pin.label ? `, ${pin.label}` : ''}`}
                        title={pin.label ?? `${SEVERITY_LABEL[pin.severity]} — ${locationLabel(pin.location)}`}
                        onClick={(event) => handlePinClick(event, pin)}
                        className={cn(
                            'absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-white shadow-lifted transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                            SEVERITY_DOT[pin.severity],
                        )}
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    />
                ))}

                {selectedPin ? (
                    <div
                        className="pointer-events-none absolute z-10 -translate-x-1/2"
                        style={{ left: `${selectedPin.x}%`, top: `${selectedPin.y}%` }}
                    >
                        <div className="-mt-10 whitespace-nowrap border border-stone-line bg-charcoal px-2 py-1 text-xs text-white shadow-lifted">
                            {selectedPin.label ?? SEVERITY_LABEL[selectedPin.severity]}
                            <span className="ml-1 text-ivory/70">• {locationLabel(selectedPin.location)}</span>
                        </div>
                    </div>
                ) : null}
            </div>

            <aside aria-label="Garment regions">
                <h3 className="font-ui text-xs font-semibold uppercase tracking-luxe text-charcoal">Regions</h3>
                <ul className="mt-3 space-y-1">
                    {GARMENT_LOCATIONS.map((region) => (
                        <li key={region.value}>
                            <button
                                type="button"
                                aria-pressed={activeLocation === region.value}
                                onClick={() => setActiveLocation(region.value)}
                                className={cn(
                                    'flex w-full cursor-pointer items-center gap-2 border px-3 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                    activeLocation === region.value
                                        ? 'border-champagne/60 bg-champagne/10 text-charcoal'
                                        : 'border-stone-line bg-white text-stone-muted hover:border-champagne/40 hover:text-charcoal',
                                )}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-champagne" aria-hidden="true" />
                                {region.label}
                            </button>
                        </li>
                    ))}
                </ul>
                <p className="mt-3 text-xs text-stone-muted">
                    {readOnly
                        ? 'Select a pin to inspect its details.'
                        : 'Select a region, then click the garment to place a pin.'}
                </p>
            </aside>
        </div>
    );
}