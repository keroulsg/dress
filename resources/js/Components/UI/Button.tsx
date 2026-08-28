import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../Lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-charcoal text-white hover:bg-rose',
                champagne: 'bg-champagne text-charcoal hover:bg-champagne-light',
                outline: 'border border-stone-line bg-white text-charcoal hover:border-champagne hover:text-rose',
                ghost: 'text-stone-muted hover:bg-ivory hover:text-charcoal',
                danger: 'bg-rose text-white hover:bg-rose-deep',
            },
            size: {
                default: 'h-10 px-5',
                sm: 'h-8 px-3 text-xs',
                lg: 'h-12 px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
        );
    },
);

Button.displayName = 'Button';

export { buttonVariants };