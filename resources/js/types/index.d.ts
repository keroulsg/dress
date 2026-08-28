import type { Role } from './models';

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role?: Role;
    email_verified_at?: string | null;
    permissions?: string[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export * from './contracts';
export * from './models';