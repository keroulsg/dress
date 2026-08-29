/**
 * Shared DTO shapes mirroring backend module contracts.
 * These are the ONLY cross-module public types frontend modules may import.
 */

export interface Money {
    amount: string;
    currency: string;
}

export interface PricingBreakdown {
    daily_rate: Money;
    rental_days: number;
    subtotal: Money;
    cleaning_fee: Money;
    delivery_fee: Money;
    discount_amount: Money;
    tax_rate: number;
    tax_amount: Money;
    chargeable_total: Money;
    security_deposit: Money;
    grand_total: Money;
    currency: string;
}

export interface DepositSettlement {
    deposit_held: Money;
    damage_deduction: Money;
    late_fee_deduction: Money;
    net_refundable_amount: Money;
    currency: string;
}

export interface CouponDiscount {
    code: string;
    discount_type: string;
    discount_amount: Money;
    subtotal: Money;
    currency: string;
}

export interface PricingCalculationInput {
    renter_id: number;
    atelier_id: number;
    items: Array<{ dress_id: number; daily_rate: string | number }>;
    start_date: string;
    end_date: string;
    rental_days: number;
    cleaning_fee?: string | number;
    tax_rate?: string | number;
    discount_amount?: string | number;
    security_deposit?: string | number;
    currency?: string;
}

export interface DressSnapshot {
    dress_id: number;
    atelier_id: number;
    title: string;
    slug: string;
    status: string;
    rental_price_per_day: Money;
    security_deposit_amount: Money;
    cleaning_fee: Money;
    late_fee_per_day: Money;
    turnaround_buffer_days: number;
    available_sizes: string[];
    primary_image_path?: string | null;
}

export interface AtelierScope {
    atelier_id: number;
    business_name: string;
    slug: string;
    is_active: boolean;
    is_approved: boolean;
    staff_role?: string | null;
    commission_rate: string | number;
}

export interface BookingSnapshot {
    booking_id: number;
    booking_reference: string;
    renter_id: number;
    atelier_id: number;
    start_date: string;
    end_date: string;
    status: string;
    items: Array<Record<string, unknown>>;
    grand_total: string;
    currency: string;
}

export interface KycStatus {
    user_id: number;
    is_verified: boolean;
    status: string;
    document_type?: string | null;
    rejection_reason?: string | null;
}

export interface NotificationEnvelope {
    recipient_id: number;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channel?: string;
}

export interface LedgerEntry {
    account_code: string;
    amount: Money;
    is_debit: boolean;
    description?: string;
}

export interface PaymentResult {
    transaction_id: number;
    status: string;
    amount: Money;
    gateway_reference?: string | null;
    is_replay?: boolean;
}

export interface InspectionResult {
    report_id: number;
    booking_id: number;
    phase: string;
    condition_summary: string;
    recommended_deduction: Money;
    approved_deduction: Money;
    customer_approved: boolean;
    damage_description?: string | null;
}

export interface UserIdentity {
    user_id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    is_verified: boolean;
}

export interface StoredAsset {
    asset_id: number;
    purpose: string;
    disk: string;
    path: string;
    public_url?: string | null;
    thumbnail_path?: string | null;
    mime_type?: string | null;
    size?: number | null;
}

/* ---- Catalog browsing (Phase 4) ---- */

export interface PaginationMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

export interface CatalogFacets {
    sizes: string[];
    silhouettes: string[];
    fabrics: string[];
    colors: string[];
    price_min: number;
    price_max: number;
}

export interface DressCard {
    id: number;
    slug: string;
    title: string;
    atelier_id: number;
    atelier_name: string;
    category_name: string;
    rental_price_per_day: Money;
    security_deposit_amount: Money;
    primary_image_path: string | null;
    thumbnail_path: string | null;
    status: string;
    condition_rating: string;
    available_sizes: string[];
}

export interface CatalogFilters {
    categories: number[];
    sizes: string[];
    silhouettes: string[];
    fabrics: string[];
    colors: string[];
    price_min: number | null;
    price_max: number | null;
    sort: string;
}

export interface DressImageItem {
    id: number;
    path: string;
    thumbnail: string | null;
    alt: string | null;
    is_primary: boolean;
    display_order: number;
}

export interface DressSizeItem {
    size_code: string;
    bust: string | null;
    waist: string | null;
    hips: string | null;
    length: string | null;
    is_available: boolean;
}

export interface DressDetail {
    id: number;
    slug: string;
    title: string;
    description: string;
    fabric_type: string;
    silhouette: string;
    color_primary: string;
    original_retail_value: Money;
    rental_price_per_day: Money;
    security_deposit_amount: Money;
    cleaning_fee: Money;
    late_fee_per_day: Money;
    turnaround_buffer_days: number;
    condition_rating: string;
    status: string;
    images: DressImageItem[];
    sizes: DressSizeItem[];
    atelier: {
        business_name: string;
        city: string | null;
        rating_average: string | null;
        is_approved: boolean;
    };
    review_summary: {
        count: number;
        average: string | null;
    };
}

export interface CategoryOption {
    id: number;
    name: string;
}