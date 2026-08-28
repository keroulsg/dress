import * as React from 'react';

import { cn } from '../../Lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <select
                className={cn(
                    'flex h-10 w-full rounded-none border border-stone-line bg-white px-3 py-2 text-sm text-charcoal transition-colors focus-visible:border-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/30 disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>
        );
    },
);

Select.displayName = 'Select';