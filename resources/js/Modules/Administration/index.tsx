/**
 * Administration module — public surface.
 */

import { Check, X } from 'lucide-react';

import { formatCurrency } from '../../Lib/currency';
import { Badge } from '../../Components/UI/Badge';
import { Button } from '../../Components/UI/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../Components/UI/Table';

export interface AtelierApprovalRow {
    id: number;
    business_name: string;
    owner_name: string;
    city?: string | null;
    commission_rate: string;
    created_at: string;
}

export interface AtelierApprovalTableProps {
    rows: AtelierApprovalRow[];
    onApprove?: (atelierId: number) => void;
    onReject?: (atelierId: number) => void;
}

/** Pending atelier approvals queue. Approvals call the Atelier module use case. */
export function AtelierApprovalTable({ rows, onApprove, onReject }: AtelierApprovalTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Atelier</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell className="font-medium text-charcoal">{row.business_name}</TableCell>
                        <TableCell>{row.owner_name}</TableCell>
                        <TableCell className="text-stone-muted">{row.city ?? '—'}</TableCell>
                        <TableCell>
                            <Badge tone="champagne">{formatCurrency(row.commission_rate, 'EGP', { showSymbol: false })}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-stone-muted">{row.created_at}</TableCell>
                        <TableCell className="text-right">
                            <div className="inline-flex gap-2">
                                {onApprove ? (
                                    <Button type="button" variant="champagne" size="sm" onClick={() => onApprove(row.id)}>
                                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                        Approve
                                    </Button>
                                ) : null}
                                {onReject ? (
                                    <Button type="button" variant="outline" size="sm" onClick={() => onReject(row.id)}>
                                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                                        Reject
                                    </Button>
                                ) : null}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}