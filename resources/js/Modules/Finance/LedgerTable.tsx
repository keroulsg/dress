/**
 * Accounting-grade double-entry ledger journal.
 */

import { useMemo, useState } from 'react';

import { EmptyState } from '../../Components/Feedback/EmptyState';
import { Input } from '../../Components/UI/Input';
import { Select } from '../../Components/UI/Select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../Components/UI/Table';
import { formatCurrency } from '../../Lib/currency';
import { formatCalendarDateShort } from '../../Lib/dates';
import { cn } from '../../Lib/utils';

export interface LedgerRow {
    transaction_id: number;
    account_code: string;
    account_name: string;
    debit: string;
    credit: string;
    description?: string;
    created_at?: string | null;
}

export interface LedgerTableProps {
    rows: LedgerRow[];
    currency?: string;
}

export type AccountType = 'asset' | 'liability' | 'revenue' | 'expense';

type AccountTypeFilter = 'all' | AccountType;

type LedgerRowWithBalance = LedgerRow & { balance: number };

const ACCOUNT_TYPES: AccountType[] = ['asset', 'liability', 'revenue', 'expense'];

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    asset: 'Asset',
    liability: 'Liability',
    revenue: 'Revenue',
    expense: 'Expense',
};

const ACCOUNT_TYPE_BY_CODE: Record<string, AccountType> = {
    '1010': 'asset',
    '2010': 'liability',
    '2020': 'liability',
    '2030': 'liability',
    '4010': 'revenue',
    '5010': 'expense',
};

function accountTypeOf(code: string): AccountType | undefined {
    return ACCOUNT_TYPE_BY_CODE[code];
}

export function LedgerTable({ rows, currency = 'EGP' }: LedgerTableProps) {
    const [accountType, setAccountType] = useState<AccountTypeFilter>('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const filteredRows = useMemo<LedgerRowWithBalance[]>(() => {
        let runningBalance = 0;

        return rows
            .filter((row) => {
                if (accountType !== 'all' && accountTypeOf(row.account_code) !== accountType) {
                    return false;
                }

                const date = row.created_at?.slice(0, 10) ?? '';

                if (date !== '') {
                    if (fromDate !== '' && date < fromDate) {
                        return false;
                    }

                    if (toDate !== '' && date > toDate) {
                        return false;
                    }
                }

                return true;
            })
            .map((row) => {
                runningBalance += Number(row.debit) - Number(row.credit);

                return { ...row, balance: runningBalance };
            });
    }, [rows, accountType, fromDate, toDate]);

    return (
        <section aria-label="General ledger" className="w-full">
            <div className="mb-4 flex flex-wrap items-end gap-x-5 gap-y-3">
                <div className="w-44">
                    <label
                        htmlFor="ledger-account-type"
                        className="mb-1.5 block text-xs uppercase tracking-luxe text-stone-muted"
                    >
                        Account type
                    </label>
                    <Select
                        id="ledger-account-type"
                        value={accountType}
                        onChange={(event) => setAccountType(event.target.value as AccountTypeFilter)}
                    >
                        <option value="all">All</option>
                        {ACCOUNT_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {ACCOUNT_TYPE_LABELS[type]}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="w-40">
                    <label htmlFor="ledger-from" className="mb-1.5 block text-xs uppercase tracking-luxe text-stone-muted">
                        From
                    </label>
                    <Input
                        id="ledger-from"
                        type="date"
                        value={fromDate}
                        onChange={(event) => setFromDate(event.target.value)}
                    />
                </div>

                <div className="w-40">
                    <label htmlFor="ledger-to" className="mb-1.5 block text-xs uppercase tracking-luxe text-stone-muted">
                        To
                    </label>
                    <Input
                        id="ledger-to"
                        type="date"
                        value={toDate}
                        onChange={(event) => setToDate(event.target.value)}
                    />
                </div>
            </div>

            {filteredRows.length === 0 ? (
                <EmptyState
                    title="No ledger entries"
                    description="Adjust the filters, or record a transaction for these accounts to appear here."
                />
            ) : (
                <Table aria-label="Ledger journal entries">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Transaction Ref</TableHead>
                            <TableHead>Account Code</TableHead>
                            <TableHead>Account Name</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead className="text-right">Running Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRows.map((row) => (
                            <TableRow key={`${row.transaction_id}-${row.account_code}`}>
                                <TableCell className="text-xs text-stone-muted">
                                    {row.created_at ? formatCalendarDateShort(row.created_at) : '—'}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-stone-muted">#{row.transaction_id}</TableCell>
                                <TableCell className="font-mono text-xs text-charcoal">{row.account_code}</TableCell>
                                <TableCell>
                                    <span className="text-sm text-charcoal">{row.account_name}</span>
                                    {row.description ? (
                                        <span className="block text-xs text-stone-muted">{row.description}</span>
                                    ) : null}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs text-charcoal">
                                    {formatCurrency(row.debit, currency)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs">
                                    <span className={cn(Number(row.credit) < 0 ? 'text-rose' : 'text-stone-muted')}>
                                        {formatCurrency(row.credit, currency)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs">
                                    <span className={cn(row.balance < 0 ? 'text-rose' : 'text-charcoal')}>
                                        {formatCurrency(row.balance, currency)}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </section>
    );
}