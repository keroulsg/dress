import * as React from 'react';

import { cn } from '../../Lib/utils';

export type ToastTone = 'success' | 'warning' | 'danger' | 'info';

interface ToastItem {
    id: number;
    title: string;
    description?: string;
    tone: ToastTone;
}

interface ToastContextValue {
    toast: (title: string, options?: { description?: string; tone?: ToastTone }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const toneBar: Record<ToastTone, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = React.useState<ToastItem[]>([]);
    const idRef = React.useRef(0);

    const toast = React.useCallback((title: string, options?: { description?: string; tone?: ToastTone }) => {
        const id = ++idRef.current;
        const tone = options?.tone ?? 'info';

        setItems((prev) => [...prev, { id, title, description: options?.description, tone }]);

        window.setTimeout(() => {
            setItems((prev) => prev.filter((item) => item.id !== id));
        }, 5000);
    }, []);

    const dismiss = React.useCallback((id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div aria-live="polite" aria-label="Notifications" className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        role="status"
                        className={cn('pointer-events-auto flex gap-3 border border-stone-line bg-white p-4 shadow-lifted', toneBar[item.tone])}
                        style={{ borderLeftWidth: '3px' }}
                    >
                        <div className="flex-1 space-y-0.5">
                            <p className="text-sm font-semibold text-charcoal">{item.title}</p>
                            {item.description ? <p className="text-xs text-stone-muted">{item.description}</p> : null}
                        </div>
                        <button
                            type="button"
                            aria-label="Dismiss"
                            onClick={() => dismiss(item.id)}
                            className="self-start text-xs text-stone-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const context = React.useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within a ToastProvider.');
    }

    return context;
}