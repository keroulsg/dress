/**
 * Atelier module — public surface.
 */

import type { AtelierScope } from '../../types/contracts';
import { Badge } from '../../Components/UI/Badge';

export type { AtelierScope };

export interface AtelierStatusBadgeProps {
    atelier: Pick<AtelierScope, 'is_active' | 'is_approved'>;
}

/** Editorial status badge for an atelier's operational approval state. */
export function AtelierStatusBadge({ atelier }: AtelierStatusBadgeProps) {
    if (!atelier.is_approved) {
        return <Badge tone="warning">Pending approval</Badge>;
    }

    return atelier.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Suspended</Badge>;
}