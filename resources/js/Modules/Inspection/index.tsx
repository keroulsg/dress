/**
 * Inspection module — public surface.
 */

import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';

export interface ChecklistItem {
    id: string;
    label: string;
    checked: boolean;
}

export interface InspectionChecklistProps {
    items: ChecklistItem[];
    onChange?: (id: string, checked: boolean) => void;
    readOnly?: boolean;
}

/** Operational inspection checklist for pre-dispatch / post-return phases. */
export function InspectionChecklist({ items, onChange, readOnly = false }: InspectionChecklistProps) {
    return (
        <ul className="space-y-1.5">
            {items.map((item) => (
                <li key={item.id}>
                    <label
                        className={cn(
                            'flex cursor-pointer items-center gap-3 border px-3 py-2.5 text-sm transition-colors',
                            item.checked ? 'border-champagne/40 bg-champagne/10' : 'border-stone-line bg-white',
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                                item.checked ? 'border-champagne bg-champagne text-white' : 'border-stone-line text-transparent',
                            )}
                        >
                            <Check className="h-3 w-3" />
                        </span>
                        <input
                            type="checkbox"
                            checked={item.checked}
                            disabled={readOnly}
                            onChange={(event) => onChange?.(item.id, event.target.checked)}
                            className="sr-only"
                        />
                        <span className={cn(item.checked && 'text-charcoal')}>{item.label}</span>
                    </label>
                </li>
            ))}
        </ul>
    );
}