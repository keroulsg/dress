import * as React from 'react';

import { cn } from '../../Lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-none border border-stone-line bg-white px-3 py-2 text-sm text-charcoal transition-colors placeholder:text-stone-muted focus-visible:border-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/30 disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);

Input.displayName = 'Input';