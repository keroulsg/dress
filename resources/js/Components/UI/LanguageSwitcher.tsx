import React from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn } from '@/Lib/utils';

interface Props {
    className?: string;
    variant?: 'pill' | 'minimal' | 'compact';
}

export function LanguageSwitcher({ className = '' }: Props) {
    const { locale, setLocale } = useLanguage();

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700 shadow-xs transition-colors',
                className,
            )}
            role="group"
            aria-label="Language selection"
        >
            <button
                type="button"
                onClick={() => setLocale('ar')}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                    locale === 'ar'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold ring-1 ring-stone-900/5 dark:ring-white/10'
                        : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200',
                )}
                aria-pressed={locale === 'ar'}
            >
                <span className="text-xs" role="img" aria-label="Arabic">🇸🇦</span>
                <span>العربية</span>
            </button>
            <button
                type="button"
                onClick={() => setLocale('en')}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                    locale === 'en'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold ring-1 ring-stone-900/5 dark:ring-white/10'
                        : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200',
                )}
                aria-pressed={locale === 'en'}
            >
                <span className="text-xs" role="img" aria-label="English">🇬🇧</span>
                <span>English</span>
            </button>
        </div>
    );
}

export default LanguageSwitcher;

