import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn } from '@/Lib/utils';

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
    const { theme, isDark, toggleTheme } = useTheme();
    const { isRtl } = useLanguage();

    const title = isDark
        ? (isRtl ? 'التبديل إلى الوضع النهاري' : 'Switch to Day Mode')
        : (isRtl ? 'التبديل إلى الوضع الليلي' : 'Switch to Night Mode');

    const label = isDark
        ? (isRtl ? 'نهاري' : 'Light')
        : (isRtl ? 'ليلي' : 'Dark');

    return (
        <button
            type="button"
            onClick={toggleTheme}
            title={title}
            aria-label={title}
            className={cn(
                'relative inline-flex items-center gap-2 rounded-xl p-2 text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50',
                isDark
                    ? 'border border-stone-800 bg-stone-900 text-amber-300 hover:bg-stone-800 hover:text-amber-200 shadow-xs'
                    : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900 shadow-xs',
                className,
            )}
        >
            <div className="relative flex items-center justify-center">
                {isDark ? (
                    <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 text-amber-400" />
                ) : (
                    <Moon className="h-4 w-4 transition-transform duration-300 rotate-0 text-stone-600" />
                )}
            </div>
            {showLabel && (
                <span className="text-[11px] font-semibold">{label}</span>
            )}
        </button>
    );
}

export default ThemeToggle;
