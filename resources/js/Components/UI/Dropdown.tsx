import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';

import { cn } from '../../Lib/utils';

export const Dropdown = DropdownMenuPrimitive.Root;
export const DropdownTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownContent({
    className,
    sideOffset = 6,
    ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                sideOffset={sideOffset}
                className={cn(
                    'z-50 min-w-[10rem] overflow-hidden rounded-none border border-stone-line bg-white p-1 shadow-lifted data-[state=open]:animate-in data-[state=closed]:animate-out',
                    className,
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

export function DropdownItem({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>) {
    return (
        <DropdownMenuPrimitive.Item
            className={cn(
                'flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-sm text-charcoal outline-none transition-colors focus:bg-ivory data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

export function DropdownLabel({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>) {
    return (
        <DropdownMenuPrimitive.Label
            className={cn('px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-stone-muted', className)}
            {...props}
        />
    );
}

export const DropdownSeparator = DropdownMenuPrimitive.Separator;