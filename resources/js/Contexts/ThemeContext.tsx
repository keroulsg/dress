import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'maison_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const existing = useContext(ThemeContext);
    if (existing) {
        return <>{children}</>;
    }
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
            if (saved === 'light' || saved === 'dark') {
                return saved;
            }
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            if (theme === 'dark') {
                root.classList.add('dark');
                root.style.colorScheme = 'dark';
            } else {
                root.classList.remove('dark');
                root.style.colorScheme = 'light';
            }
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        return {
            theme: 'light',
            isDark: false,
            setTheme: () => {},
            toggleTheme: () => {},
        };
    }
    return context;
}
