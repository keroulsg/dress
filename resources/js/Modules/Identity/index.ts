/**
 * Identity module — public surface.
 * Other modules may import these types/helpers only.
 */

import { usePage } from '@inertiajs/react';

import type { UserIdentity } from '../../types/contracts';
import type { AuthUser, Role } from '../../Lib/permissions';

export type { AuthUser, Role, UserIdentity };

export function useAuth(): { user: AuthUser | null } {
    const { props } = usePage();
    const auth = props.auth as { user: AuthUser | null };

    return { user: auth.user ?? null };
}

export function usePermissions(): string[] {
    const { user } = useAuth();

    return user?.permissions ?? [];
}

export const ROLE_LABELS: Record<Role, string> = {
    superadmin: 'Superadmin',
    atelier_owner: 'Atelier owner',
    atelier_staff: 'Atelier staff',
    renter: 'Renter',
};