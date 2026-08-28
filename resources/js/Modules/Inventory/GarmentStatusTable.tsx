import { useForm } from '@inertiajs/react';
import { CalendarX, Check, MoreHorizontal, Sparkles, Wrench } from 'lucide-react';
import * as React from 'react';

import { Alert } from '../../Components/Feedback/Alert';
import { EmptyState } from '../../Components/Feedback/EmptyState';
import { useToast } from '../../Components/Feedback/Toast';
import { Badge } from '../../Components/UI/Badge';
import { Button } from '../../Components/UI/Button';
import {
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
    DropdownTrigger,
} from '../../Components/UI/Dropdown';
import { Input } from '../../Components/UI/Input';
import { Modal, ModalContent, ModalTitle } from '../../Components/UI/Modal';
import { Select } from '../../Components/UI/Select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../Components/UI/Table';
import { Textarea } from '../../Components/UI/Textarea';
import { formatCurrency } from '../../Lib/currency';
import { formatTimestamp } from '../../Lib/dates';
import { dressStatus, statusColors } from '../../Lib/tokens';

export interface GarmentRow {
    id: number;
    title: string;
    slug: string;
    status: string;
    rental_price_per_day: string;
    primary_image: string | null;
    category: string | null;
    updated_at: string | null;
}

export interface GarmentStatusTableProps {
    atelierId: number;
    garments: GarmentRow[];
    onChanged?: () => void;
}

type ActionKind = 'cleaning' | 'maintenance' | 'block' | 'complete';

interface ActiveAction {
    kind: ActionKind;
    garment: GarmentRow;
}

const ACTION_LABELS: Record<ActionKind, { title: string; submit: string; success: string }> = {
    cleaning: { title: 'Send to cleaning', submit: 'Send to cleaning', success: 'Garment sent to cleaning' },
    maintenance: { title: 'Start maintenance', submit: 'Start maintenance', success: 'Garment moved to maintenance' },
    block: { title: 'Block dates', submit: 'Block dates', success: 'Dates blocked' },
    complete: { title: 'Complete maintenance', submit: 'Complete maintenance', success: 'Maintenance completed' },
};

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="mb-1.5 block text-xs uppercase tracking-luxe text-stone-muted">
            {children}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    return message ? <p className="mt-1.5 text-xs text-danger">{message}</p> : null;
}

export function GarmentStatusTable({ atelierId, garments, onChanged }: GarmentStatusTableProps) {
    const { toast } = useToast();
    const [action, setAction] = React.useState<ActiveAction | null>(null);

    const cleaningForm = useForm<{ days: string }>({ days: '3' });
    const maintenanceForm = useForm<{ start_date: string; end_date: string; issue_description: string }>({
        start_date: '',
        end_date: '',
        issue_description: '',
    });
    const blockForm = useForm<{ start_date: string; end_date: string; notes: string }>({
        start_date: '',
        end_date: '',
        notes: '',
    });
    const completeForm = useForm({});

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!action) {
            return;
        }

        const dressId = action.garment.id;
        const finish = (): void => {
            toast(ACTION_LABELS[action.kind].success, { tone: 'success' });
            setAction(null);
            onChanged?.();
        };

        switch (action.kind) {
            case 'cleaning':
                cleaningForm.post(`/atelier/${atelierId}/dresses/${dressId}/inventory/cleaning`, {
                    onSuccess: () => {
                        cleaningForm.reset();
                        finish();
                    },
                });
                break;
            case 'maintenance':
                maintenanceForm.post(`/atelier/${atelierId}/dresses/${dressId}/inventory/maintenance`, {
                    onSuccess: () => {
                        maintenanceForm.reset();
                        finish();
                    },
                });
                break;
            case 'block':
                blockForm.post(`/atelier/${atelierId}/dresses/${dressId}/availability/block`, {
                    onSuccess: () => {
                        blockForm.reset();
                        finish();
                    },
                });
                break;
            case 'complete':
                completeForm.post(`/atelier/${atelierId}/dresses/${dressId}/inventory/maintenance/complete`, {
                    onSuccess: () => {
                        completeForm.reset();
                        finish();
                    },
                });
                break;
        }
    };

    const isProcessing = (): boolean => {
        if (!action) {
            return false;
        }

        switch (action.kind) {
            case 'cleaning':
                return cleaningForm.processing;
            case 'maintenance':
                return maintenanceForm.processing;
            case 'block':
                return blockForm.processing;
            case 'complete':
                return completeForm.processing;
        }
    };

    const activeErrors = (): string[] => {
        if (!action) {
            return [];
        }

        switch (action.kind) {
            case 'cleaning':
                return Object.values(cleaningForm.errors);
            case 'maintenance':
                return Object.values(maintenanceForm.errors);
            case 'block':
                return Object.values(blockForm.errors);
            case 'complete':
                return Object.values(completeForm.errors);
        }
    };

    return (
        <>
            {garments.length === 0 ? (
                <EmptyState
                    title="No garments in the atelier"
                    description="Inventory updates will appear here once garments are added."
                />
            ) : (
                <Table aria-label="Garment inventory status">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Garment</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price / day</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {garments.map((garment) => {
                            const meta = dressStatus[garment.status] ?? {
                                color: statusColors.stone,
                                label: garment.status || 'Unknown',
                            };

                            return (
                                <TableRow key={garment.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden bg-stone-line/40">
                                                {garment.primary_image ? (
                                                    <img
                                                        src={garment.primary_image}
                                                        alt={garment.title}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center font-display text-xs text-stone-muted">
                                                        No photo
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-display text-base text-charcoal">{garment.title}</p>
                                                <p className="text-xs text-stone-muted">#{garment.slug}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-stone-muted">{garment.category ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge style={{ color: meta.color, backgroundColor: `${meta.color}18` }}>
                                            {meta.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(garment.rental_price_per_day, 'EGP')}
                                        <span className="text-xs text-stone-muted"> / day</span>
                                    </TableCell>
                                    <TableCell className="text-stone-muted">
                                        {garment.updated_at ? formatTimestamp(garment.updated_at) : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dropdown>
                                            <DropdownTrigger asChild>
                                                <Button variant="outline" size="icon" aria-label={`Manage ${garment.title}`}>
                                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                                </Button>
                                            </DropdownTrigger>
                                            <DropdownContent align="end">
                                                <DropdownItem onSelect={() => setAction({ kind: 'cleaning', garment })}>
                                                    <Sparkles className="h-4 w-4 text-stone-muted" aria-hidden="true" />
                                                    Send to cleaning
                                                </DropdownItem>
                                                <DropdownItem onSelect={() => setAction({ kind: 'maintenance', garment })}>
                                                    <Wrench className="h-4 w-4 text-stone-muted" aria-hidden="true" />
                                                    Start maintenance
                                                </DropdownItem>
                                                <DropdownItem onSelect={() => setAction({ kind: 'block', garment })}>
                                                    <CalendarX className="h-4 w-4 text-stone-muted" aria-hidden="true" />
                                                    Block dates
                                                </DropdownItem>
                                                {garment.status === 'maintenance' ? (
                                                    <>
                                                        <DropdownSeparator />
                                                        <DropdownItem onSelect={() => setAction({ kind: 'complete', garment })}>
                                                            <Check className="h-4 w-4 text-success" aria-hidden="true" />
                                                            Complete maintenance
                                                        </DropdownItem>
                                                    </>
                                                ) : null}
                                            </DropdownContent>
                                        </Dropdown>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}

            {action ? (
                <Modal open onOpenChange={(open) => { if (!open) setAction(null); }}>
                    <ModalContent className="max-w-md">
                        <ModalTitle className="font-display text-2xl text-charcoal">
                            {ACTION_LABELS[action.kind].title}
                        </ModalTitle>
                        <p className="mt-1 text-sm text-stone-muted">{action.garment.title}</p>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            {action.kind === 'cleaning' ? (
                                <div>
                                    <FieldLabel htmlFor="cleaning-days">Days in cleaning</FieldLabel>
                                    <Select
                                        id="cleaning-days"
                                        value={cleaningForm.data.days}
                                        onChange={(event) => cleaningForm.setData('days', event.target.value)}
                                    >
                                        {Array.from({ length: 14 }, (_, index) => index + 1).map((value) => (
                                            <option key={value} value={value}>
                                                {value} {value === 1 ? 'day' : 'days'}
                                            </option>
                                        ))}
                                    </Select>
                                    <FieldError message={cleaningForm.errors.days} />
                                </div>
                            ) : null}

                            {action.kind === 'maintenance' ? (
                                <>
                                    <div>
                                        <FieldLabel htmlFor="maintenance-start">Start date</FieldLabel>
                                        <Input
                                            id="maintenance-start"
                                            type="date"
                                            value={maintenanceForm.data.start_date}
                                            onChange={(event) => maintenanceForm.setData('start_date', event.target.value)}
                                        />
                                        <FieldError message={maintenanceForm.errors.start_date} />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="maintenance-end">End date</FieldLabel>
                                        <Input
                                            id="maintenance-end"
                                            type="date"
                                            value={maintenanceForm.data.end_date}
                                            onChange={(event) => maintenanceForm.setData('end_date', event.target.value)}
                                        />
                                        <FieldError message={maintenanceForm.errors.end_date} />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="maintenance-issue">Issue description</FieldLabel>
                                        <Textarea
                                            id="maintenance-issue"
                                            value={maintenanceForm.data.issue_description}
                                            onChange={(event) =>
                                                maintenanceForm.setData('issue_description', event.target.value)
                                            }
                                            placeholder="Describe what needs attention"
                                        />
                                        <FieldError message={maintenanceForm.errors.issue_description} />
                                    </div>
                                </>
                            ) : null}

                            {action.kind === 'block' ? (
                                <>
                                    <div>
                                        <FieldLabel htmlFor="block-start">Start date</FieldLabel>
                                        <Input
                                            id="block-start"
                                            type="date"
                                            value={blockForm.data.start_date}
                                            onChange={(event) => blockForm.setData('start_date', event.target.value)}
                                        />
                                        <FieldError message={blockForm.errors.start_date} />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="block-end">End date</FieldLabel>
                                        <Input
                                            id="block-end"
                                            type="date"
                                            value={blockForm.data.end_date}
                                            onChange={(event) => blockForm.setData('end_date', event.target.value)}
                                        />
                                        <FieldError message={blockForm.errors.end_date} />
                                    </div>
                                    <div>
                                        <FieldLabel htmlFor="block-notes">Notes</FieldLabel>
                                        <Textarea
                                            id="block-notes"
                                            value={blockForm.data.notes}
                                            onChange={(event) => blockForm.setData('notes', event.target.value)}
                                            placeholder="Optional note for the block"
                                        />
                                        <FieldError message={blockForm.errors.notes} />
                                    </div>
                                </>
                            ) : null}

                            {action.kind === 'complete' ? (
                                <p className="text-sm text-stone-muted">
                                    This marks the garment available again and lifts its maintenance blocks.
                                </p>
                            ) : null}

                            {activeErrors().length > 0 ? (
                                <Alert tone="danger" title="Unable to save changes">
                                    {activeErrors().join(' ')}
                                </Alert>
                            ) : null}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setAction(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isProcessing()}>
                                    {ACTION_LABELS[action.kind].submit}
                                </Button>
                            </div>
                        </form>
                    </ModalContent>
                </Modal>
            ) : null}
        </>
    );
}