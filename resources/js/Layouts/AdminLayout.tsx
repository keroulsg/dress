import type { PropsWithChildren } from 'react';

import { ToastProvider } from '../Components/Feedback/Toast';
import { AdminNavbar } from '../Components/Navigation/AdminNavbar';

export default function AdminLayout({ children }: PropsWithChildren) {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-stone-line/30 text-charcoal">
                <AdminNavbar />
                <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</main>
                <footer className="border-t border-stone-line bg-white px-4 py-4">
                    <p className="mx-auto max-w-7xl text-xs text-stone-muted lg:px-8">
                        Admin Console — platform operations. All administrative actions are audited.
                    </p>
                </footer>
            </div>
        </ToastProvider>
    );
}