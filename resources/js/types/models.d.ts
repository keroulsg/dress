/**
 * Core entity interfaces mirroring the database ownership map.
 * Modules own their entities; cross-module access uses contracts.d.ts shapes.
 */

export type Role = 'superadmin' | 'atelier_owner' | 'atelier_staff' | 'renter';

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role?: Role;
    email_verified_at?: string | null;
    phone_verified_at?: string | null;
    rating_average?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Atelier {
    id: number;
    owner_user_id: number;
    business_name: string;
    slug: string;
    license_number: string;
    description?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    commission_rate: string;
    is_active: boolean;
    approved_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface AtelierStaff {
    id: number;
    atelier_id: number;
    user_id: number;
    role: string;
    is_active: boolean;
}

export interface Category {
    id: number;
    parent_id?: number | null;
    name: string;
    slug: string;
    description?: string | null;
    sort_order: number;
    is_active: boolean;
}

export type DressStatus =
    | 'draft'
    | 'active'
    | 'rented'
    | 'reserved'
    | 'maintenance'
    | 'cleaning'
    | 'alteration'
    | 'retired';

export interface Dress {
    id: number;
    atelier_id: number;
    category_id: number;
    title: string;
    slug: string;
    sku: string;
    description?: string | null;
    fabric_type?: string | null;
    silhouette?: string | null;
    color_primary?: string | null;
    original_retail_value: string;
    rental_price_per_day: string;
    security_deposit_amount: string;
    cleaning_fee: string;
    late_fee_per_day: string;
    turnaround_buffer_days: number;
    condition_rating?: number | null;
    status: DressStatus;
    published_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface DressImage {
    id: number;
    dress_id: number;
    image_path: string;
    thumbnail_path?: string | null;
    display_order: number;
    is_primary: boolean;
    alt_text?: string | null;
}

export interface DressSize {
    id: number;
    dress_id: number;
    size_code: string;
    bust?: string | null;
    waist?: string | null;
    hips?: string | null;
    length?: string | null;
    is_available: boolean;
}

export type BookingStatus =
    | 'pending_payment'
    | 'confirmed'
    | 'fitting_scheduled'
    | 'ready_for_dispatch'
    | 'dispatched'
    | 'in_customer_possession'
    | 'returned_pending_inspection'
    | 'inspection_completed'
    | 'completed'
    | 'disputed'
    | 'cancelled'
    | 'expired';

export interface Booking {
    id: number;
    booking_reference: string;
    renter_id: number;
    atelier_id: number;
    fitting_datetime?: string | null;
    start_date: string;
    end_date: string;
    actual_dispatched_at?: string | null;
    actual_received_at?: string | null;
    actual_returned_at?: string | null;
    rental_days_count: number;
    rental_rate_total: string;
    cleaning_fee_total: string;
    security_deposit_amount: string;
    late_fee_total: string;
    discount_amount: string;
    tax_amount: string;
    grand_total: string;
    deposit_held: boolean;
    deposit_refunded: boolean;
    deposit_deducted: boolean;
    currency: string;
    status: BookingStatus;
    cancellation_reason?: string | null;
    cancelled_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface BookingItem {
    id: number;
    booking_id: number;
    dress_id: number;
    quantity: number;
    unit_rental_price: string;
    rental_days: number;
    subtotal: string;
}

export type TransactionType =
    | 'rental_payment'
    | 'deposit_authorization'
    | 'deposit_capture'
    | 'deposit_release'
    | 'deposit_penalty'
    | 'customer_refund'
    | 'atelier_payout'
    | 'platform_commission'
    | 'tax'
    | 'adjustment';

export interface Transaction {
    id: number;
    booking_id?: number | null;
    user_id: number;
    atelier_id: number;
    type: TransactionType;
    amount: string;
    currency: string;
    payment_method?: string | null;
    gateway_reference?: string | null;
    status: string;
    processed_at?: string | null;
    created_at: string;
}

export interface LedgerAccount {
    id: number;
    code: string;
    name: string;
    type: 'asset' | 'liability' | 'revenue' | 'expense' | 'equity';
    currency: string;
    is_active: boolean;
}

export interface InspectionReport {
    id: number;
    booking_id: number;
    inspector_id: number;
    phase: 'pre_dispatch' | 'post_return';
    condition_summary?: string | null;
    damage_description?: string | null;
    recommended_deposit_deduction: string;
    approved_deposit_deduction: string;
    customer_approved: boolean;
    customer_approved_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface KycVerification {
    id: number;
    user_id: number;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    document_type: string;
    front_path: string;
    back_path?: string | null;
    reviewed_by?: number | null;
    reviewed_at?: string | null;
    rejection_reason?: string | null;
    created_at: string;
    updated_at: string;
}

export type DisputeStatus =
    | 'open'
    | 'under_review'
    | 'awaiting_customer'
    | 'awaiting_atelier'
    | 'resolved'
    | 'rejected';

export interface Dispute {
    id: number;
    booking_id: number;
    opened_by: number;
    reason: string;
    description?: string | null;
    status: DisputeStatus;
    resolution?: string | null;
    resolved_by?: number | null;
    resolved_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Review {
    id: number;
    booking_id: number;
    renter_id: number;
    dress_id: number;
    atelier_id: number;
    rating: number;
    comment?: string | null;
    atelier_reply?: string | null;
    atelier_replied_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: number;
    user_id?: number | null;
    action: string;
    auditable_type: string;
    auditable_id?: number | null;
    old_values_json?: string | null;
    new_values_json?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
}