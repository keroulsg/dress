/**
 * Damage entry form for atelier inspection. Reports a finding on a specific
 * garment region with photo evidence, estimated repair cost, and the deposit
 * deduction to propose.
 */

import { Camera, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { Badge } from '../../Components/UI/Badge';
import { Button } from '../../Components/UI/Button';
import { Input } from '../../Components/UI/Input';
import { Modal, ModalContent, ModalTitle } from '../../Components/UI/Modal';
import { Select } from '../../Components/UI/Select';
import { Textarea } from '../../Components/UI/Textarea';
import { cn } from '../../Lib/utils';
import { GARMENT_LOCATIONS, type DamageSeverity } from './GarmentInspectionCanvas';

export interface DamageEntry {
    location: string;
    damage_type: string;
    severity: DamageSeverity;
    description: string;
    repair_cost: string;
    deduction_amount: string;
    photo: File | null;
}

export interface DamageMarkerToolProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location?: string;
    onSubmit?: (data: DamageEntry) => void;
}

const DAMAGE_TYPES: readonly { value: string; label: string }[] = [
    { value: 'stain', label: 'Stain' },
    { value: 'tear', label: 'Tear' },
    { value: 'missing_beads', label: 'Missing beads' },
    { value: 'broken_zipper', label: 'Broken zipper' },
    { value: 'alteration', label: 'Alteration' },
    { value: 'burn', label: 'Burn' },
    { value: 'water_damage', label: 'Water damage' },
    { value: 'irreparable', label: 'Irreparable' },
    { value: 'other', label: 'Other' },
];

const SEVERITY_OPTIONS: readonly {
    value: DamageSeverity;
    label: string;
    badgeClasses: string;
}[] = [
    { value: 'minor', label: 'Minor', badgeClasses: 'border border-champagne/40 bg-champagne/15 text-champagne' },
    { value: 'moderate', label: 'Moderate', badgeClasses: 'border border-warning/40 bg-warning/15 text-warning' },
    { value: 'major', label: 'Major', badgeClasses: 'border border-rose/40 bg-rose/15 text-rose' },
    { value: 'critical', label: 'Critical', badgeClasses: 'border border-rose-deep/40 bg-rose-deep/15 text-rose-deep' },
];

const LABEL_CLASSES = 'text-xs font-medium uppercase tracking-luxe text-stone-muted';

/** Records a damage finding against the garment under inspection. */
export function DamageMarkerTool({ open, onOpenChange, location, onSubmit }: DamageMarkerToolProps) {
    const [locationValue, setLocationValue] = React.useState<string>(location ?? 'other');
    const [damageType, setDamageType] = React.useState<string>('stain');
    const [severity, setSeverity] = React.useState<DamageSeverity>('minor');
    const [description, setDescription] = React.useState('');
    const [repairCost, setRepairCost] = React.useState('');
    const [deductionAmount, setDeductionAmount] = React.useState('');
    const [photo, setPhoto] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (location) {
            setLocationValue(location);
        }
    }, [location]);

    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0] ?? null;
        event.target.value = '';
        if (!file) {
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPhoto(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearPhoto = (): void => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPhoto(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        onSubmit?.({
            location: locationValue,
            damage_type: damageType,
            severity,
            description: description.trim(),
            repair_cost: repairCost,
            deduction_amount: deductionAmount,
            photo,
        });

        setDescription('');
        setRepairCost('');
        setDeductionAmount('');
        setDamageType('stain');
        setSeverity('minor');
        clearPhoto();
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="max-h-[90vh] overflow-y-auto">
                <ModalTitle className="font-display text-2xl font-semibold tracking-luxe text-charcoal">
                    Record damage
                </ModalTitle>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label htmlFor="damage-location" className={LABEL_CLASSES}>
                                Location
                            </label>
                            <Select
                                id="damage-location"
                                value={locationValue}
                                onChange={(event) => setLocationValue(event.target.value)}
                            >
                                {GARMENT_LOCATIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="damage-type" className={LABEL_CLASSES}>
                                Damage type
                            </label>
                            <Select
                                id="damage-type"
                                value={damageType}
                                onChange={(event) => setDamageType(event.target.value)}
                            >
                                {DAMAGE_TYPES.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <fieldset className="space-y-1.5">
                        <legend className={LABEL_CLASSES}>Severity</legend>
                        <div className="grid grid-cols-4 gap-2">
                            {SEVERITY_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={severity === option.value}
                                    onClick={() => setSeverity(option.value)}
                                    className={cn(
                                        'flex cursor-pointer items-center justify-center rounded-full border py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose',
                                        severity === option.value
                                            ? 'border-champagne bg-champagne/10'
                                            : 'border-stone-line bg-white hover:border-champagne/60',
                                    )}
                                >
                                    <Badge className={cn(option.badgeClasses, severity !== option.value && 'opacity-60')}>
                                        {option.label}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <div className="space-y-1.5">
                        <span className={LABEL_CLASSES}>Photo evidence</span>
                        {previewUrl ? (
                            <div className="relative overflow-hidden border border-stone-line bg-ivory">
                                <img src={previewUrl} alt="Damage photo preview" className="aspect-[4/3] w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={clearPhoto}
                                    aria-label="Remove photo"
                                    className="absolute right-2 top-2 cursor-pointer rounded-full bg-charcoal/70 p-1.5 text-white transition-colors hover:bg-rose-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-stone-line bg-ivory text-stone-muted transition-colors hover:border-champagne/60 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                            >
                                <Camera className="h-6 w-6" aria-hidden="true" />
                                <span className="text-xs">Add photo</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            id="damage-photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="sr-only"
                        />
                        <label htmlFor="damage-photo" className="sr-only">
                            Photo evidence
                        </label>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="damage-description" className={LABEL_CLASSES}>
                            Description
                        </label>
                        <Textarea
                            id="damage-description"
                            rows={3}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Describe the damage in detail…"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label htmlFor="repair-cost" className={LABEL_CLASSES}>
                                Estimated repair cost
                            </label>
                            <Input
                                id="repair-cost"
                                type="number"
                                min="0"
                                step="0.01"
                                value={repairCost}
                                onChange={(event) => setRepairCost(event.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="deduction-amount" className={LABEL_CLASSES}>
                                Suggested deposit deduction
                            </label>
                            <Input
                                id="deduction-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={deductionAmount}
                                onChange={(event) => setDeductionAmount(event.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-stone-line pt-4">
                        <Button type="submit" variant="primary">
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Add damage
                        </Button>
                    </div>
                </form>
            </ModalContent>
        </Modal>
    );
}