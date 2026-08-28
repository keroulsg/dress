import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

import { ToastProvider } from '../Components/Feedback/Toast';
import { AtelierSidebar } from '../Components/Navigation/AtelierSidebar';
import { Breadcrumbs, type Crumb } from '../Components/Navigation/Breadcrumbs';
import type { AtelierScope } from '../types/contracts';

export interface AtelierLayoutProps extends PropsWithChildren {
    breadcrumbs?: Crumb[];
    title?: string;
}

export default function AtelierLayout({ children, breadcrumbs = [], title }: AtelierLayoutProps) {
    const { atelier } = usePage().props as unknown as { atelier?: AtelierScope | null };

    const scope = atelier ?? null;

    return (
        <ToastProvider>
            <div className="flex min-h-screen bg-ivory text-charcoal">
                <div className="hidden w-64 shrink-0 lg:block">
                    <div className="fixed inset-y-0 left-0 w-64">
                        <AtelierSidebar
                            businessName={scope?.business_name ?? 'My Atelier'}
                            storeActive={scope?.is_active ?? false}
                            roleBadge={scope?.staff_role ?? 'Owner'}
                            user={{ name: '' }}
                        />
                    </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-stone-line bg-ivory/90 px-4 py-3 backdrop-blur lg:px-8">
                        <div className="flex items-center justify-between">
                            <Breadcrumbs items={breadcrumbs} homeHref="/atelier" />
                            <Link
                                href="/atelier/inspections"
                                className="hidden text-xs font-medium text-rose-deep transition-colors hover:text-rose sm:block"
                            >
                                Inspection queue
                            </Link>
                        </div>
                        {title ? <h1 className="mt-2 font-display text-2xl text-charcoal">{title}</h1> : null}
                    </header>

                    <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
                </div>
            </div>
        </ToastProvider>
    );
}