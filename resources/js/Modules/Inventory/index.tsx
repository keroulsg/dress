/**
 * Inventory module — public surface.
 */

import { Badge } from '../../Components/UI/Badge';
import { dressStatus } from '../../Lib/tokens';

export type InventoryStatus =
    | 'available'
    | 'reserved'
    | 'rented'
    | 'cleaning'
    | 'maintenance'
    | 'alteration'
    | 'retired';

export interface InventoryStatusBadgeProps {
    status: InventoryStatus;
}

/** Controlled operational state badge. Status changes are server-side only. */
export function InventoryStatusBadge({ status }: InventoryStatusBadgeProps) {
    const meta = dressStatus[status] ?? dressStatus.draft;

    return <Badge tone="info">{meta.label}</Badge>;
}