/**
 * Orders management — atelier booking pipeline & kanban.
 */

import { Link, useForm } from '@inertiajs/react';
import * as React from 'react';
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock,
    Filter,
    Layers,
    LayoutGrid,
    List,
    Phone,
    Plus,
    Search,
    Send,
    Sparkles,
    User,
} from 'lucide-react';

import { EmptyState } from '../../Components/Feedback/EmptyState';
import { useToast } from '../../Components/Feedback/Toast';
import { Badge } from '../../Components/UI/Badge';
import { Button } from '../../Components/UI/Button';
import { Modal, ModalContent, ModalTitle } from '../../Components/UI/Modal';
import { Select } from '../../Components/UI/Select';
import { Textarea } from '../../Components/UI/Textarea';
import { formatCurrency } from '../../Lib/currency';
import { formatDateRange } from '../../Lib/dates';
import { useLanguage } from '../../Contexts/LanguageContext';
import { cn } from '../../Lib/utils';

export interface OrdersManagementBooking {
    id: number;
    booking_reference: string;
    status: string;
    start_date: string;
    end_date: string;
    grand_total: string;
    currency: string;
    renter: { name: string; phone: string | null };
    dress_title: string | null;
}

export interface OrdersManagementProps {
    atelierId: number;
    bookings: OrdersManagementBooking[];
    statuses: string[];
}

const OPERATIONAL_STATES = [
    'ready_for_dispatch',
    'dispatched',
    'in_customer_possession',
    'returned_pending_inspection',
] as const;

const NEXT_STATES: Record<string, string> = {
    ready_for_dispatch: 'dispatched',
    dispatched: 'in_customer_possession',
    in_customer_possession: 'returned_pending_inspection',
    returned_pending_inspection: 'inspection_completed',
};

export function OrdersManagement({ atelierId, bookings, statuses }: OrdersManagementProps) {
    const { toast } = useToast();
    const { t, tr, isRtl } = useLanguage();
    const [search, setSearch] = React.useState('');
    const [activeTab, setActiveTab] = React.useState<string>('all');
    const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
    const [activeBooking, setActiveBooking] = React.useState<OrdersManagementBooking | null>(null);

    const transitionForm = useForm<{ target_status: string; reason: string }>({
        target_status: '',
        reason: '',
    });

    const getStatusLabel = (status: string): string => {
        return t(`status.${status}`, status.replace(/_/g, ' '));
    };

    const getStatusTone = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'champagne' => {
        switch (status) {
            case 'ready_for_dispatch':
            case 'in_customer_possession':
            case 'inspection_completed':
            case 'completed':
            case 'active':
                return 'success';
            case 'pending_payment':
            case 'returned_pending_inspection':
            case 'reserved':
            case 'maintenance':
                return 'warning';
            case 'disputed':
            case 'cancelled':
                return 'danger';
            case 'dispatched':
            case 'confirmed':
            case 'rented':
                return 'info';
            default:
                return 'champagne';
        }
    };

    const filteredBookings = React.useMemo(() => {
        return bookings.filter((b) => {
            const matchesSearch =
                search.trim() === '' ||
                b.booking_reference.toLowerCase().includes(search.toLowerCase()) ||
                (b.renter.name && b.renter.name.toLowerCase().includes(search.toLowerCase())) ||
                (b.renter.phone && b.renter.phone.includes(search)) ||
                (b.dress_title && b.dress_title.toLowerCase().includes(search.toLowerCase()));

            const matchesTab =
                activeTab === 'all'
                    ? true
                    : activeTab === 'other'
                      ? !OPERATIONAL_STATES.includes(b.status as any)
                      : b.status === activeTab;

            return matchesSearch && matchesTab;
        });
    }, [bookings, search, activeTab]);

    const openTransition = (booking: OrdersManagementBooking): void => {
        const target = NEXT_STATES[booking.status];
        if (!target) {
            return;
        }
        transitionForm.reset();
        transitionForm.setData('target_status', target);
        setActiveBooking(booking);
    };

    const submitTransition = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (!activeBooking) {
            return;
        }
        transitionForm.post(`/atelier/${atelierId}/bookings/${activeBooking.id}/transition`, {
            onSuccess: () => {
                toast(t('atelier.bookings.success_advance'), {
                    tone: 'success',
                    description: `#${activeBooking.booking_reference}`,
                });
                setActiveBooking(null);
                transitionForm.reset();
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header / Search / View Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                        {t('atelier.bookings.title')}
                    </h1>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {t('atelier.bookings.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Switcher */}
                    <div className="flex items-center rounded-xl bg-stone-200/70 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
                        <button
                            type="button"
                            onClick={() => setViewMode('kanban')}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                viewMode === 'kanban'
                                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            )}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            <span>{t('atelier.bookings.view_kanban')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                            )}
                        >
                            <List className="h-3.5 w-3.5" />
                            <span>{t('atelier.bookings.view_table')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                <div className="relative flex-1">
                    <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400", isRtl ? "right-3" : "left-3")} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('atelier.bookings.search_placeholder')}
                        className={cn(
                            "w-full rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30",
                            isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                        )}
                    />
                </div>

                {/* Stage Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all",
                            activeTab === 'all'
                                ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                        )}
                    >
                        {t('atelier.bookings.all_stages')} ({bookings.length})
                    </button>
                    {OPERATIONAL_STATES.map((st) => {
                        const count = bookings.filter((b) => b.status === st).length;
                        return (
                            <button
                                key={st}
                                type="button"
                                onClick={() => setActiveTab(st)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5",
                                    activeTab === st
                                        ? "bg-amber-600 text-white shadow-xs"
                                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                                )}
                            >
                                <span>{getStatusLabel(st)}</span>
                                <span className={cn(
                                    "h-4 min-w-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
                                    activeTab === st ? "bg-white/30 text-white" : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                                )}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Empty State */}
            {filteredBookings.length === 0 ? (
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-12 text-center shadow-xs">
                    <CalendarDays className="h-12 w-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                        {t('atelier.bookings.empty_title')}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                        {t('atelier.bookings.empty_desc')}
                    </p>
                </div>
            ) : viewMode === 'kanban' ? (
                /* Kanban Columns View */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
                    {OPERATIONAL_STATES.map((status) => {
                        const items = filteredBookings.filter((b) => b.status === status);
                        const canAdvance = status in NEXT_STATES;

                        return (
                            <div
                                key={status}
                                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/60 p-4 shadow-xs flex flex-col min-h-[420px]"
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Badge tone={getStatusTone(status)}>
                                            {getStatusLabel(status)}
                                        </Badge>
                                    </div>
                                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center justify-center shadow-2xs">
                                        {items.length}
                                    </span>
                                </div>

                                {/* Booking Cards List */}
                                <div className="space-y-3 flex-1">
                                    {items.length === 0 ? (
                                        <div className="h-32 flex items-center justify-center rounded-xl border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 text-xs">
                                            {tr('لا توجد طلبات في هذه المرحلة', 'No bookings in this stage')}
                                        </div>
                                    ) : (
                                        items.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="group rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-xs hover:shadow-md transition-all space-y-3"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <Link
                                                        href={`/atelier/${atelierId}/bookings/${booking.id}`}
                                                        className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60 hover:underline flex items-center gap-1"
                                                    >
                                                        #{booking.booking_reference}
                                                    </Link>
                                                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                                        {formatCurrency(booking.grand_total, booking.currency)}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h4 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                                                        {booking.dress_title ?? tr('فستان هوت كوتور', 'Haute Couture Gown')}
                                                    </h4>
                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                                                        <User className="h-3.5 w-3.5 text-stone-400" />
                                                        <span>{booking.renter.name}</span>
                                                    </div>
                                                    {booking.renter.phone && (
                                                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-500 font-mono">
                                                            <Phone className="h-3 w-3 text-stone-400" />
                                                            <span>{booking.renter.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-800/80 px-2.5 py-1.5 rounded-lg text-[11px] text-stone-600 dark:text-stone-300 font-mono border border-stone-100 dark:border-stone-800">
                                                    <CalendarDays className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                    <span className="truncate">{formatDateRange(booking.start_date, booking.end_date)}</span>
                                                </div>

                                                {canAdvance && (
                                                    <Button
                                                        type="button"
                                                        variant="champagne"
                                                        size="sm"
                                                        className="w-full text-xs font-semibold justify-center shadow-xs"
                                                        onClick={() => openTransition(booking)}
                                                    >
                                                        <Send className={cn("h-3 w-3", isRtl ? "ml-1.5" : "mr-1.5")} />
                                                        {t('atelier.bookings.advance_btn')}
                                                    </Button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Luxury Table List View */
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs">
                            <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5 text-start">{tr('المرجع', 'Reference')}</th>
                                    <th className="px-6 py-3.5 text-start">{tr('الفستان', 'Gown')}</th>
                                    <th className="px-6 py-3.5 text-start">{tr('العميلة', 'Client')}</th>
                                    <th className="px-6 py-3.5 text-start">{tr('فترة الإيجار', 'Rental Window')}</th>
                                    <th className="px-6 py-3.5 text-start">{tr('القيمة', 'Total')}</th>
                                    <th className="px-6 py-3.5 text-start">{tr('الحالة', 'Status')}</th>
                                    <th className="px-6 py-3.5 text-end">{tr('الإجراء', 'Action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {filteredBookings.map((booking) => {
                                    const canAdvance = booking.status in NEXT_STATES;
                                    return (
                                        <tr key={booking.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                                                <Link
                                                    href={`/atelier/${atelierId}/bookings/${booking.id}`}
                                                    className="hover:underline flex items-center gap-1"
                                                >
                                                    #{booking.booking_reference}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 font-serif font-bold text-stone-900 dark:text-stone-100">
                                                {booking.dress_title ?? tr('فستان هوت كوتور', 'Haute Couture Gown')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-stone-900 dark:text-stone-100">{booking.renter.name}</p>
                                                {booking.renter.phone && (
                                                    <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">{booking.renter.phone}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-stone-600 dark:text-stone-300">
                                                {formatDateRange(booking.start_date, booking.end_date)}
                                            </td>
                                            <td className="px-6 py-4 font-serif font-bold text-stone-900 dark:text-stone-100">
                                                {formatCurrency(booking.grand_total, booking.currency)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge tone={getStatusTone(booking.status)}>
                                                    {getStatusLabel(booking.status)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-end">
                                                {canAdvance ? (
                                                    <Button
                                                        type="button"
                                                        variant="champagne"
                                                        size="sm"
                                                        className="text-xs"
                                                        onClick={() => openTransition(booking)}
                                                    >
                                                        {t('atelier.bookings.advance_btn')}
                                                    </Button>
                                                ) : (
                                                    <span className="text-stone-400 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Advance Booking Stage Modal */}
            {activeBooking && (
                <Modal open onOpenChange={(open) => { if (!open) setActiveBooking(null); }}>
                    <ModalContent className="max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xl">
                        <ModalTitle className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                            {t('atelier.bookings.modal_title')}
                        </ModalTitle>
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                            {t('atelier.bookings.modal_desc')} · #{activeBooking.booking_reference}
                        </p>

                        <div className="my-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                            <p className="font-bold">{activeBooking.dress_title ?? 'Gown'}</p>
                            <p className="text-[11px] mt-0.5">{activeBooking.renter.name} · {formatCurrency(activeBooking.grand_total, activeBooking.currency)}</p>
                        </div>

                        <form onSubmit={submitTransition} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-700 dark:text-stone-300 mb-1">
                                    {t('atelier.bookings.target_stage')}
                                </label>
                                <Select
                                    id="transition-target"
                                    value={transitionForm.data.target_status}
                                    onChange={(event) => transitionForm.setData('target_status', event.target.value)}
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 rounded-xl"
                                >
                                    <option value="">{t('atelier.bookings.select_stage')}</option>
                                    {NEXT_STATES[activeBooking.status] && (
                                        <option value={NEXT_STATES[activeBooking.status]}>
                                            {getStatusLabel(NEXT_STATES[activeBooking.status])}
                                        </option>
                                    )}
                                </Select>
                                {transitionForm.errors.target_status && (
                                    <p className="mt-1 text-xs text-rose-600">{transitionForm.errors.target_status}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-700 dark:text-stone-300 mb-1">
                                    {t('atelier.bookings.reason_label')}
                                </label>
                                <Textarea
                                    id="transition-reason"
                                    value={transitionForm.data.reason}
                                    onChange={(event) => transitionForm.setData('reason', event.target.value)}
                                    placeholder={t('atelier.bookings.reason_placeholder')}
                                    rows={3}
                                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveBooking(null)}
                                    className="text-xs"
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="champagne"
                                    size="sm"
                                    disabled={transitionForm.processing}
                                    className="text-xs font-semibold"
                                >
                                    <CheckCircle2 className={cn("h-4 w-4", isRtl ? "ml-1.5" : "mr-1.5")} />
                                    {transitionForm.processing ? tr('جاري الحفظ...', 'Saving...') : t('atelier.bookings.confirm_advance')}
                                </Button>
                            </div>
                        </form>
                    </ModalContent>
                </Modal>
            )}
        </div>
    );
}