/**
 * Decimal-safe currency formatting (ISO 4217).
 *
 * All financial amounts arrive from the backend as decimal strings. The
 * frontend formats for display only — it never recomputes financial truth.
 */

export type CurrencyCode = 'EGP' | 'SAR' | 'USD';

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
    EGP: 'ar-EG',
    SAR: 'ar-SA',
    USD: 'en-US',
};

const CURRENCY_LABELS: Record<CurrencyCode, string> = {
    EGP: 'EGP',
    SAR: 'SAR',
    USD: 'USD',
};

export function isSupportedCurrency(value: string): value is CurrencyCode {
    return value in CURRENCY_LOCALES;
}

export function normalizeCurrency(value: string): CurrencyCode {
    return isSupportedCurrency(value) ? value : 'EGP';
}

/** True when a decimal amount string represents zero. */
export function isZeroAmount(amount: string): boolean {
    return Number(amount) === 0;
}

/**
 * Formats an amount string (or number) in the given currency. Amounts must be
 * decimal strings from the backend; parsing via Number is display-only.
 */
export function formatCurrency(
    amount: number | string,
    currency: string,
    options: { showSymbol?: boolean } = {},
): string {
    const code = normalizeCurrency(currency);
    const numeric = typeof amount === 'string' ? Number(amount) : amount;
    const { showSymbol = true } = options;

    if (!Number.isFinite(numeric)) {
        return showSymbol ? `— ${CURRENCY_LABELS[code]}` : '—';
    }

    const formatter = new Intl.NumberFormat(CURRENCY_LOCALES[code], {
        style: 'currency',
        currency: code,
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    if (showSymbol) {
        return formatter.format(numeric);
    }

    return `${new Intl.NumberFormat(CURRENCY_LOCALES[code], {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numeric)} ${CURRENCY_LABELS[code]}`;
}

/** Compact form for dashboards: "1.5K EGP". */
export function formatCompact(amount: number | string, currency: string): string {
    const code = normalizeCurrency(currency);
    const numeric = typeof amount === 'string' ? Number(amount) : amount;

    if (!Number.isFinite(numeric)) {
        return '—';
    }

    return `${new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(numeric)} ${CURRENCY_LABELS[code]}`;
}