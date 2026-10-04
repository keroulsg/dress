import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with sensible precedence. */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Resolves an image path or URL to a valid browser URL.
 * Ensures relative storage paths are prefixed with /storage/.
 */
export function resolveImageUrl(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }
    const clean = path.replace(/^\/+/, '');
    if (clean.startsWith('storage/')) {
        return `/${clean}`;
    }
    return `/storage/${clean}`;
}