import * as React from 'react';

import { cn } from '../../Lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    'flex min-h-[80px] w-full rounded-none border border-stone-line bg-white px-3 py-2 text-sm text-charcoal transition-colors placeholder:text-stone-muted focus-visible:border-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/30 disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);

Textarea.displayName = 'Textarea';