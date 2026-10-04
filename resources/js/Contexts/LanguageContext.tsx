import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, type Locale, type TranslationKey } from '../Lib/translations';

interface LanguageContextType {
    locale: Locale;
    direction: 'rtl' | 'ltr';
    isRtl: boolean;
    setLocale: (locale: Locale) => void;
    toggleLocale: () => void;
    t: (key: TranslationKey | string, fallback?: string) => string;
    tr: (ar: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'maison_locale';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const existing = useContext(LanguageContext);
    if (existing) {
        return <>{children}</>;
    }
    const [locale, setLocaleState] = useState<Locale>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY) as Locale;
            if (saved === 'ar' || saved === 'en') {
                return saved;
            }
        }
        return 'ar'; // Default to Arabic as primary
    });

    const direction = locale === 'ar' ? 'rtl' : 'ltr';
    const isRtl = locale === 'ar';

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.dir = direction;
            document.documentElement.lang = locale;
            localStorage.setItem(STORAGE_KEY, locale);
        }
    }, [locale, direction]);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
    };

    const toggleLocale = () => {
        setLocaleState((prev) => (prev === 'ar' ? 'en' : 'ar'));
    };

    const t = (key: TranslationKey | string, fallback?: string): string => {
        const dict = translations[locale] as Record<string, string>;
        if (dict && dict[key] !== undefined) {
            return dict[key];
        }
        // Fallback to other language or fallback string or key itself
        const otherLocale = locale === 'ar' ? 'en' : 'ar';
        const otherDict = translations[otherLocale] as Record<string, string>;
        return otherDict?.[key] ?? fallback ?? key;
    };

    const tr = (ar: string, en: string): string => {
        return locale === 'ar' ? ar : en;
    };

    return (
        <LanguageContext.Provider value={{ locale, direction, isRtl, setLocale, toggleLocale, t, tr }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (!context) {
        // Fallback gracefully if used outside provider
        const isRtl = true;
        return {
            locale: 'ar',
            direction: 'rtl',
            isRtl: true,
            setLocale: () => {},
            toggleLocale: () => {},
            t: (key: string, fallback?: string) => translations.ar[key as TranslationKey] ?? fallback ?? key,
            tr: (ar: string, en: string) => ar,
        };
    }
    return context;
}
