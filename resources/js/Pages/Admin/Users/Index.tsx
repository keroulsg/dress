import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ShieldCheck, Users, Search, Store, ShoppingBag, Trash2 } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

interface Props {
    users: {
        data: any[];
        links: any[];
        total: number;
    };
    stats: {
        total: number;
        superadmins: number;
        ateliers: number;
        renters: number;
    };
    filters: {
        search?: string;
        role?: string;
    };
}

export default function UsersIndex({ users, stats, filters }: Props) {
    const { tr, locale } = useLanguage();
    const isRtl = locale === 'ar';
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search: searchTerm, role: selectedRole }, { preserveState: true });
    };

    const handleRoleFilter = (role: string) => {
        setSelectedRole(role);
        router.get('/admin/users', { search: searchTerm, role: role || undefined }, { preserveState: true });
    };

    const handleRoleChange = (userId: number, newRole: string) => {
        const msg = isRtl
            ? `هل أنت متأكد من تغيير دور هذا المستخدم إلى ${newRole}؟`
            : `Are you sure you want to change this user's role to ${newRole}?`;
        if (confirm(msg)) {
            router.put(`/admin/users/${userId}/role`, { role: newRole });
        }
    };

    const handleDeleteUser = (userId: number, name: string) => {
        const msg = isRtl
            ? `تحذير: هل أنت متأكد من رغبتك في حذف حساب المستخدم "${name}" نهائياً؟`
            : `Warning: Are you sure you want to permanently delete user "${name}"?`;
        if (confirm(msg)) {
            router.delete(`/admin/users/${userId}`);
        }
    };

    return (
        <AdminLayout>
            <Head title={tr('إدارة المستخدمين | Maison Admin', 'User Management | Maison Admin')} />

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                    {tr('إدارة المستخدمين والحسابات', 'User & Account Management')}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {tr(
                        'التحكم في صلاحيات الأعضاء، أصحاب الأتيليهات، والمستأجرات عبر منصة ميزون رنتال',
                        'Control permissions for members, atelier owners, and renters across Maison platform'
                    )}
                </p>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('إجمالي الحسابات', 'Total Accounts')}
                        </span>
                        <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">{stats.total}</p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">
                        {tr('مستخدم مسجل في المنصة', 'Registered platform users')}
                    </span>
                </div>

                <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('مديرو المنصة', 'Super Admins')}
                        </span>
                        <ShieldCheck className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">{stats.superadmins}</p>
                    <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium mt-1 block">
                        {tr('صلاحيات إدارة مركزية كاملة', 'Full platform permissions')}
                    </span>
                </div>

                <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('صاحبات الأتيليهات', 'Atelier Owners')}
                        </span>
                        <Store className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">{stats.ateliers}</p>
                    <span className="text-[11px] text-amber-800 dark:text-amber-400 font-medium mt-1 block">
                        {tr('حسابات تجار ومصممين', 'Designer & merchant accounts')}
                    </span>
                </div>

                <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            {tr('المستأجرات / العملاء', 'Renters / Customers')}
                        </span>
                        <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">{stats.renters}</p>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1 block">
                        {tr('عملاء نشطون', 'Active platform clients')}
                    </span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 mb-6 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-stone-400`} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={tr('بحث بالاسم، البريد أو الهاتف…', 'Search by name, email or phone…')}
                            className={`w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 ${
                                isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
                            } py-2 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none`}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => handleRoleFilter('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                !selectedRole
                                    ? 'bg-stone-900 text-white dark:bg-amber-600 dark:text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                            }`}
                        >
                            {tr('الكل', 'All')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleFilter('superadmin')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                selectedRole === 'superadmin'
                                    ? 'bg-stone-900 text-white dark:bg-amber-600 dark:text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                            }`}
                        >
                            {tr('مدير منصة', 'Super Admin')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleFilter('atelier_owner')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                selectedRole === 'atelier_owner'
                                    ? 'bg-stone-900 text-white dark:bg-amber-600 dark:text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                            }`}
                        >
                            {tr('صاحبة أتيليه', 'Atelier Owner')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRoleFilter('renter')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                selectedRole === 'renter'
                                    ? 'bg-stone-900 text-white dark:bg-amber-600 dark:text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                            }`}
                        >
                            {tr('مستأجرة', 'Renter')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Users Data Table */}
            <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs">
                <div className="overflow-x-auto">
                    <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                        <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-5 py-3.5">{tr('المستخدم', 'User')}</th>
                                <th className="px-5 py-3.5">{tr('الدور والصلاحية', 'Role & Permission')}</th>
                                <th className="px-5 py-3.5">{tr('رقم الهاتف', 'Phone Number')}</th>
                                <th className="px-5 py-3.5">{tr('النشاط (أتيليهات / حجوزات)', 'Activity')}</th>
                                <th className="px-5 py-3.5">{tr('تاريخ الانضمام', 'Joined Date')}</th>
                                <th className="px-5 py-3.5 text-center">{tr('إجراءات', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold border border-stone-200 dark:border-stone-700">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-stone-900 dark:text-stone-100">{user.name}</p>
                                                    <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                                                    user.role === 'superadmin' || user.role === 'super_admin'
                                                        ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                                        : user.role === 'atelier_owner'
                                                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                                }`}
                                            >
                                                {user.role === 'superadmin' || user.role === 'super_admin'
                                                    ? tr('مدير المنصة', 'Super Admin')
                                                    : user.role === 'atelier_owner'
                                                      ? tr('صاحبة أتيليه', 'Atelier Owner')
                                                      : tr('مستأجرة / عميل', 'Renter / Client')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-mono text-stone-500 dark:text-stone-400">
                                            {user.phone || '—'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-stone-600 dark:text-stone-300 font-medium">
                                                {user.ateliers_count > 0
                                                    ? `${user.ateliers_count} ${tr('أتيليه', 'Atelier(s)')}`
                                                    : `${user.bookings_count} ${tr('حجز', 'Booking(s)')}`}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-stone-400 dark:text-stone-500 font-mono text-[11px]">
                                            {new Date(user.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="inline-flex items-center gap-2">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-2 py-1 text-[11px] text-stone-700 dark:text-stone-200 focus:border-amber-500 focus:outline-none"
                                                >
                                                    <option value="renter">{tr('مستأجرة', 'Renter')}</option>
                                                    <option value="atelier_owner">{tr('صاحبة أتيليه', 'Atelier Owner')}</option>
                                                    <option value="superadmin">{tr('مدير منصة', 'Super Admin')}</option>
                                                </select>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                                    className="p-1 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                    title={tr('حذف المستخدم', 'Delete User')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-stone-400 dark:text-stone-500">
                                        {tr('لا يوجد مستخدمون يطابقون شروط البحث المحددة.', 'No users found matching search criteria.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
