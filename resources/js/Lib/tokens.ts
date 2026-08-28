/**
 * Design tokens — single source of truth for the visual system.
 * Import colors/spacing from here instead of hardcoding hex values in
 * components. Mirrors the Tailwind @theme in resources/css/app.css.
 */

export const palette = {
    ivory: '#FAF8F5',
    white: '#FFFFFF',
    champagne: '#C5A059',
    champagneLight: '#E6D9BD',
    rose: '#9B4B58',
    roseDeep: '#7A3845',
    charcoal: '#1C1917',
    stone: '#78716C',
    line: '#E7E5E4',
} as const;

export const statusColors = {
    success: '#2F7D5B',
    warning: '#B7791F',
    danger: '#B3414B',
    info: '#3B6EA5',
    stone: '#78716C',
} as const;

/**
 * Booking lifecycle → presentation color and label.
 */
export const bookingStatus: Record<string, { color: string; label: string }> = {
    pending_payment: { color: statusColors.warning, label: 'Pending payment' },
    confirmed: { color: statusColors.info, label: 'Confirmed' },
    fitting_scheduled: { color: statusColors.info, label: 'Fitting scheduled' },
    ready_for_dispatch: { color: statusColors.success, label: 'Ready to dispatch' },
    dispatched: { color: statusColors.info, label: 'Dispatched' },
    in_customer_possession: { color: statusColors.success, label: 'In your possession' },
    returned_pending_inspection: { color: statusColors.warning, label: 'Returned — inspection' },
    inspection_completed: { color: statusColors.success, label: 'Inspection completed' },
    completed: { color: statusColors.success, label: 'Completed' },
    disputed: { color: statusColors.danger, label: 'Disputed' },
    cancelled: { color: statusColors.stone, label: 'Cancelled' },
    expired: { color: statusColors.stone, label: 'Expired' },
} as const;

/**
 * Dress inventory/status → presentation color and label.
 */
export const dressStatus: Record<string, { color: string; label: string }> = {
    draft: { color: statusColors.stone, label: 'Draft' },
    active: { color: statusColors.success, label: 'Available' },
    rented: { color: statusColors.info, label: 'Rented' },
    reserved: { color: statusColors.warning, label: 'Reserved' },
    maintenance: { color: statusColors.danger, label: 'Maintenance' },
    cleaning: { color: statusColors.info, label: 'Cleaning' },
    alteration: { color: statusColors.warning, label: 'Alteration' },
    retired: { color: statusColors.stone, label: 'Retired' },
} as const;

export const typography = {
    fontDisplay: 'var(--font-display)',
    fontSans: 'var(--font-sans)',
    fontUi: 'var(--font-ui)',
    fontArabic: 'var(--font-arabic)',
    trackingLuxe: 'var(--tracking-luxe)',
} as const;

export const radii = {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '8px',
    full: '9999px',
} as const;

export const shadows = {
    subtle: '0 1px 2px rgb(28 25 23 / 0.04)',
    lifted: '0 10px 30px -12px rgb(28 25 23 / 0.16)',
} as const;