/**
 * Frontend permission helpers. These are display helpers only — every
 * protected operation is enforced server-side via Policies/Gates.
 */

export type Role = 'superadmin' | 'atelier_owner' | 'atelier_staff' | 'renter';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role?: Role;
    atelier_id?: number | null;
    permissions?: string[];
}

export function hasRole(user: AuthUser | null | undefined, role: Role): boolean {
    return user?.role === role;
}

export function hasAnyRole(user: AuthUser | null | undefined, roles: Role[]): boolean {
    return user != null && roles.includes(user.role as Role);
}

export function hasPermission(user: AuthUser | null | undefined, permission: string): boolean {
    return user?.permissions?.includes(permission) ?? false;
}

/** Whether the acting user manages a given atelier scope. */
export function scopesToAtelier(
    user: AuthUser | null | undefined,
    atelierId: number | null | undefined,
): boolean {
    if (user == null || atelierId == null) {
        return false;
    }

    if (user.role === 'superadmin') {
        return true;
    }

    return user.atelier_id === atelierId;
}