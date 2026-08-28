/**
 * Finance module — public surface.
 */

import { formatCurrency } from '../../Lib/currency';
import { Badge } from '../../Components/UI/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../Components/UI/Table';

export interface LedgerRow {
    transaction_id: number;
    account_code: string;
    account_name: string;
    debit: string;
    credit: string;
    currency: string;
    description?: string;
}

export interface LedgerTableProps {
    rows: LedgerRow[];
}

/** Read-only ledger view. Deltas are server-authoritative; no editing here. */
export function LedgerTable({ rows }: LedgerTableProps) {
    const currency = rows[0]?.currency ?? 'EGP';

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead>Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={`${row.transaction_id}-${row.account_code}`}>
                        <TableCell className="font-mono text-xs">#{row.transaction_id}</TableCell>
                        <TableCell>
                            <span className="font-mono text-xs text-stone-muted">{row.account_code}</span>{' '}
                            {row.account_name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                            {row.debit !== '0.00' ? formatCurrency(row.debit, currency) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                            {row.credit !== '0.00' ? formatCurrency(row.credit, currency) : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-stone-muted">{row.description}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export interface LedgerBalanceBadgeProps {
    balanced: boolean;
}

export function LedgerBalanceBadge({ balanced }: LedgerBalanceBadgeProps) {
    return balanced ? <Badge tone="success">Balanced</Badge> : <Badge tone="danger">Unbalanced</Badge>;
}