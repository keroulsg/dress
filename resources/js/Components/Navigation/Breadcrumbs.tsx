import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../Lib/utils';

export interface Crumb {
    label: string;
    href?: string;
}

export interface BreadcrumbsProps {
    items: Crumb[];
    homeHref?: string;
}

export function Breadcrumbs({ items, homeHref = '/' }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-stone-muted">
            <Link href={homeHref} className="inline-flex items-center gap-1 transition-colors hover:text-charcoal">
                <Home className="h-3.5 w-3.5" aria-hidden="true" />
                Home
            </Link>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={`${item.label}-${index}`}>
                        <ChevronRight className="h-3 w-3" aria-hidden="true" />
                        {item.href && !isLast ? (
                            <Link href={item.href} className="transition-colors hover:text-charcoal">
                                {item.label}
                            </Link>
                        ) : (
                            <span className={cn(isLast && 'font-medium text-charcoal')} aria-current={isLast ? 'page' : undefined}>
                                {item.label}
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}