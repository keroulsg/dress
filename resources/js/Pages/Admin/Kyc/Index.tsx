import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    UserCheck,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    FileText,
    Download,
    Eye,
    Building2,
    User,
    ShieldCheck,
    X,
    ExternalLink,
    Filter,
} from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface KycItem {
    id: number;
    user_id: number;
    document_type: string;
    status: 'pending' | 'approved' | 'rejected' | string;
    rejection_reason?: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string | null;
        role?: 'atelier_owner' | 'renter' | string;
        atelier_name?: string | null;
    };
    front_url: string;
    back_url?: string | null;
    front_download_url: string;
    back_download_url?: string | null;
}

interface Props {
    kycs: {
        data: KycItem[];
        links: any[];
        total: number;
    };
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        atelier_owners?: number;
        renters?: number;
    };
    filters: {
        search?: string;
        status?: string;
        role?: string;
    };
}

export default function KycIndex({ kycs, stats, filters }: Props) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string; downloadUrl: string } | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/kyc', {
            search: searchTerm,
            status: filters.status,
            role: filters.role,
        }, { preserveState: true });
    };

    const handleRoleFilter = (role?: string) => {
        router.get('/admin/kyc', {
            search: filters.search,
            status: filters.status,
            role: role || undefined,
        }, { preserveState: true });
    };

    const handleStatusFilter = (status?: string) => {
        router.get('/admin/kyc', {
            search: filters.search,
            status: status || undefined,
            role: filters.role,
        }, { preserveState: true });
    };

    const handleReview = (id: number, status: 'approved' | 'rejected') => {
        const promptMsg = isRtl
            ? 'يرجى كتابة سبب رفض مستند التحقق (سيظهر لصاحب الطلب):'
            : 'Please enter the reason for rejecting the verification document:';
        const reason = status === 'rejected' ? prompt(promptMsg) : null;
        if (status === 'rejected' && !reason) return;

        router.post(`/admin/kyc/${id}/review`, {
            status,
            rejection_reason: reason,
        });
    };

    return (
        <AdminLayout>
            <Head title={tr('مراجعة وتوثيق الهويات (KYC) | Maison Admin', 'KYC & Identity Verification | Maison Admin')} />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                    {tr('مركز توثيق الهويات والاعتماد الأمني (KYC)', 'KYC Verification & Accreditation Center')}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {tr(
                        'مراجعة وتوثيق البطاقات الوطنية لأصحاب الأتيليهات والمستأجرات لضمان أمان المعاملات وتفادي الاحتيال',
                        'Audit and verify National IDs for Atelier Owners and Renters to secure transactions'
                    )}
                </p>
            </div>

            {/* Explanatory 3-Type KYC Banner */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 mb-8">
                <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                    <ShieldCheck className="h-5 w-5" />
                    <span>{tr('أنواع توثيق الهوية الثلاثة في المنصة', 'The 3 Distinct KYC Verification Types in Maison')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700 dark:text-stone-300">
                    <div className="bg-white/80 dark:bg-stone-900/80 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40">
                        <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">
                            {tr('1. توثيق صاحبة الأتيليه ⬅️ مدير المنصة', '1. Atelier Owner ⬅️ Platform Admin')}
                        </span>
                        <p className="text-stone-500 dark:text-stone-400">
                            {tr(
                                'تقوم صاحبة الأتيليه برفع بطاقتها من إعدادات الأتيليه، وبمجرد موافقة الإدارة يتم تفعيل متجر الأتيليه وقبول الحجوزات.',
                                'Atelier owner uploads ID in Atelier Settings. Admin approval activates the studio.'
                            )}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-stone-900/80 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40">
                        <span className="font-bold text-rose-700 dark:text-rose-400 block mb-1">
                            {tr('2. توثيق المستأجرة ⬅️ مدير المنصة', '2. Renter ⬅️ Platform Admin')}
                        </span>
                        <p className="text-stone-500 dark:text-stone-400">
                            {tr(
                                'تقوم المستأجرة برفع بطاقتها من لوحة حسابها، وموافقة الإدارة تمنحها شارة الحساب الموثق لتأجير الفساتين.',
                                'Renter submits ID in Client Hub. Admin approval verifies the account for rentals.'
                            )}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-stone-900/80 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                            {tr('3. توثيق المستأجرة ⬅️ صاحبة الأتيليه', '3. Renter ⬅️ Atelier Owner')}
                        </span>
                        <p className="text-stone-500 dark:text-stone-400">
                            {tr(
                                'يظهر تلقائياً لصاحبة الأتيليه في تفاصيل كل حجز لمعاينة وتنزيل بطاقة المستأجرة ومطابقتها قبل تسليم الفستان.',
                                'Visible to Atelier Owner inside booking details to inspect & download ID before handover.'
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('إجمالي الطلبات', 'Total Submissions')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.total}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('بانتظار الفحص', 'Pending Review')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-amber-600 dark:text-amber-400 mt-3">{stats.pending}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('أصحاب الأتيليهات', 'Atelier Owners')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.atelier_owners ?? 0}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('العميلات المستأجرات', 'Renters')}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                            <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-3">{stats.renters ?? 0}</p>
                </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                {/* Role Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <button
                        type="button"
                        onClick={() => handleRoleFilter(undefined)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                            !filters.role
                                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                        }`}
                    >
                        {tr('الكل', 'All')}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleFilter('atelier_owner')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                            filters.role === 'atelier_owner'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                        }`}
                    >
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{tr('توثيق أصحاب الأتيليهات (النوع 1)', 'Atelier Owners (Type 1)')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleFilter('renter')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                            filters.role === 'renter'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                        }`}
                    >
                        <User className="h-3.5 w-3.5" />
                        <span>{tr('توثيق المستأجرات (النوع 2)', 'Renters (Type 2)')}</span>
                    </button>
                </div>

                {/* Search Box */}
                <form onSubmit={handleSearch} className="relative min-w-[240px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={tr('بحث بالاسم أو البريد الإلكتروني...', 'Search by name or email...')}
                        className="w-full pl-3 pr-9 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                </form>
            </div>

            {/* KYC Submissions Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
                <div className="overflow-x-auto">
                    <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                        <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3.5">{tr('صاحب الطلب والدور', 'User & Role')}</th>
                                <th className="px-5 py-3.5">{tr('نوع المستند', 'Document')}</th>
                                <th className="px-5 py-3.5">{tr('معاينة البطاقة', 'ID Preview')}</th>
                                <th className="px-5 py-3.5">{tr('تنزيل الملفات', 'Download Files')}</th>
                                <th className="px-5 py-3.5">{tr('الحالة', 'Status')}</th>
                                <th className="px-5 py-3.5 text-center">{tr('الإجراءات', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                            {kycs.data.length > 0 ? (
                                kycs.data.map((kyc) => (
                                    <tr key={kyc.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                                        {/* User & Role */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-start gap-2.5">
                                                <div className="mt-0.5 p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                                    {kyc.user?.role === 'atelier_owner' ? (
                                                        <Building2 className="h-4 w-4 text-amber-600" />
                                                    ) : (
                                                        <User className="h-4 w-4 text-rose-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-stone-900 dark:text-stone-100">{kyc.user?.name || tr('مستخدم', 'User')}</p>
                                                    <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">{kyc.user?.email}</p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span
                                                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                                kyc.user?.role === 'atelier_owner'
                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                                            }`}
                                                        >
                                                            {kyc.user?.role === 'atelier_owner'
                                                                ? tr('صاحبة أتيليه', 'Atelier Owner')
                                                                : tr('مستأجرة', 'Renter')}
                                                        </span>
                                                        {kyc.user?.atelier_name && (
                                                            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                                                                ({kyc.user.atelier_name})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Document Type */}
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-1 text-xs">
                                                <FileText className="h-3.5 w-3.5 text-amber-600" />
                                                <span>{kyc.document_type || tr('بطاقة رقم قومي', 'National ID')}</span>
                                            </span>
                                            <span className="block text-[10px] text-stone-400 mt-1 font-mono">
                                                {new Date(kyc.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                                            </span>
                                        </td>

                                        {/* Thumbnail Previews */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                {/* Front */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewImage({
                                                            url: kyc.front_url,
                                                            title: `${kyc.user?.name} - ${tr('الوجه الأمامي', 'Front Side')}`,
                                                            downloadUrl: kyc.front_download_url,
                                                        })
                                                    }
                                                    className="group relative w-14 h-10 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:ring-2 hover:ring-amber-500 transition-all"
                                                    title={tr('عرض الوجه الأمامي', 'View Front ID')}
                                                >
                                                    <img src={kyc.front_url} alt="Front ID" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </div>
                                                </button>

                                                {/* Back */}
                                                {kyc.back_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewImage({
                                                                url: kyc.back_url!,
                                                                title: `${kyc.user?.name} - ${tr('الوجه الخلفي', 'Back Side')}`,
                                                                downloadUrl: kyc.back_download_url!,
                                                            })
                                                        }
                                                        className="group relative w-14 h-10 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:ring-2 hover:ring-amber-500 transition-all"
                                                        title={tr('عرض الوجه الخلفي', 'View Back ID')}
                                                    >
                                                        <img src={kyc.back_url} alt="Back ID" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-stone-400 italic">
                                                        {tr('وجه واحد', '1 side')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Direct Download Buttons */}
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <a
                                                    href={kyc.front_download_url}
                                                    download
                                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400"
                                                >
                                                    <Download className="h-3 w-3 text-amber-600" />
                                                    <span>{tr('تنزيل الأمامي', 'Front ID')}</span>
                                                </a>
                                                {kyc.back_download_url && (
                                                    <a
                                                        href={kyc.back_download_url}
                                                        download
                                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400"
                                                    >
                                                        <Download className="h-3 w-3 text-amber-600" />
                                                        <span>{tr('تنزيل الخلفي', 'Back ID')}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                                    kyc.status === 'approved'
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                        : kyc.status === 'rejected'
                                                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                                }`}
                                            >
                                                {kyc.status === 'approved'
                                                    ? tr('موثق ومعتمد', 'Verified & Approved')
                                                    : kyc.status === 'rejected'
                                                      ? tr('مرفوض', 'Rejected')
                                                      : tr('قيد المراجعة', 'Pending')}
                                            </span>
                                            {kyc.rejection_reason && (
                                                <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 max-w-xs">
                                                    {kyc.rejection_reason}
                                                </p>
                                            )}
                                        </td>

                                        {/* Review Actions */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleReview(kyc.id, 'approved')}
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-xs transition-colors shadow-xs"
                                                >
                                                    {tr('قبول واعتماد', 'Approve')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReview(kyc.id, 'rejected')}
                                                    className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100/60 font-medium text-xs transition-colors"
                                                >
                                                    {tr('رفض', 'Reject')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-stone-400 dark:text-stone-500">
                                        {tr('لا توجد طلبات تحقق من الهوية مسجلة وفق التصفية الحالية.', 'No KYC requests match the current filter.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* High-Res Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                    <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
                            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                                {previewImage.title}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setPreviewImage(null)}
                                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Image Viewer */}
                        <div className="p-4 flex items-center justify-center bg-stone-950 max-h-[70vh] overflow-auto">
                            <img
                                src={previewImage.url}
                                alt="ID Preview"
                                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
                            />
                        </div>

                        {/* Modal Footer with Download */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800">
                            <a
                                href={previewImage.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>{tr('فتح في نافذة جديدة', 'Open in New Window')}</span>
                            </a>

                            <a
                                href={previewImage.downloadUrl}
                                download
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                <span>{tr('تنزيل الصورة على جهازي', 'Download to Computer')}</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
