import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;

export function ModalContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
            <DialogPrimitive.Content
                className={cn(
                    'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-lifted focus:outline-none',
                    className,
                )}
                {...props}
            >
                {children}
                {showCloseButton ? (
                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-none p-1 text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose">
                        <X className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                ) : null}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

export const ModalTitle = DialogPrimitive.Title;
export const ModalDescription = DialogPrimitive.Description;
export const ModalClose = DialogPrimitive.Close;