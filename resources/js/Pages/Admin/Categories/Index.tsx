import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useLanguage } from '@/Contexts/LanguageContext';
import { cn } from '@/Lib/utils';
import {
    Edit,
    Layers,
    Plus,
    Tag,
    Trash2,
    X,
} from 'lucide-react';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
    is_active: boolean;
    dresses_count: number;
}

interface CategoriesProps {
    categories: CategoryItem[];
}

export default function AdminCategoriesIndex({ categories }: CategoriesProps) {
    const { t, tr, isRtl } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        icon: '',
        is_active: true as boolean,
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setData({
            name: '',
            slug: '',
            description: '',
            icon: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (cat: CategoryItem) => {
        setEditingCategory(cat);
        setData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            icon: cat.icon || '',
            is_active: cat.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/admin/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/categories', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm(tr('هل أنت متأكد من حذف هذا التصنيف؟', 'Are you sure you want to delete this category?'))) {
            destroy(`/admin/categories/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title={`${tr('إدارة الأقسام والتصنيفات', 'Categories & Catalogs Governance')} | Maison Admin`} />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-wide">
                            {tr('إدارة التصنيفات والأقسام العامة', 'Categories & Catalogs Governance')}
                        </h1>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                            {tr('إضافة وتعديل أقسام المنصة (فساتين زفاف، سهرة، حقائب وإكسسوارات، عبايات، مجوهرات)', 'Manage platform categories and collections (Bridal, Evening, Haute Couture, Accessories, Fine Jewelry)')}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-stone-900 dark:bg-amber-600 px-4 py-2.5 text-xs font-bold text-amber-300 dark:text-white hover:bg-stone-800 dark:hover:bg-amber-500 transition-all shadow-xs"
                    >
                        <Plus className="h-4 w-4" />
                        <span>{tr('+ إضافة تصنيف جديد', '+ Add New Category')}</span>
                    </button>
                </div>

                {/* Categories Table */}
                <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs overflow-hidden">
                    <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-stone-50/70 dark:bg-stone-950/50">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <Layers className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                            <span>{tr('جميع التصنيفات المتاحة بالمنصة', 'All Available Platform Categories')} ({categories.length})</span>
                        </span>
                    </div>

                    {categories.length === 0 ? (
                        <div className="p-12 text-center text-sm text-stone-400 dark:text-stone-500">
                            <Layers className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                            <p className="font-medium text-stone-800 dark:text-stone-200">{tr('لا توجد أي تصنيفات مضافة حتى الآن.', 'No categories registered yet.')}</p>
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-stone-900 dark:bg-amber-600 px-3.5 py-2 text-xs font-bold text-amber-300 dark:text-white hover:bg-stone-800 dark:hover:bg-amber-500 transition-all"
                            >
                                {tr('إنشاء أول تصنيف', 'Create First Category')}
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className={cn('w-full text-xs', isRtl ? 'text-right' : 'text-left')}>
                                <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 text-stone-500 dark:text-stone-400 uppercase text-[11px]">
                                    <tr>
                                        <th className="px-6 py-3.5">{tr('اسم التصنيف', 'Category Name')}</th>
                                        <th className="px-6 py-3.5">{tr('الرابط المباشر (Slug)', 'Slug')}</th>
                                        <th className="px-6 py-3.5">{tr('الوصف', 'Description')}</th>
                                        <th className="px-6 py-3.5">{tr('القطع المرتبطة', 'Garments Count')}</th>
                                        <th className="px-6 py-3.5">{tr('الحالة', 'Status')}</th>
                                        <th className="px-6 py-3.5 text-center">{tr('الإجراءات', 'Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                                <Tag className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                                <span>{cat.name}</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-stone-500 dark:text-stone-400">{cat.slug}</td>
                                            <td className="px-6 py-4 text-stone-500 dark:text-stone-400 max-w-xs truncate">
                                                {cat.description || '—'}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                                                {cat.dresses_count} {tr('قطع', 'items')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold',
                                                        cat.is_active
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
                                                    )}
                                                >
                                                    {cat.is_active ? tr('مفعّل ونشط', 'Active in Store') : tr('مخفي', 'Hidden')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(cat)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-2.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors shadow-2xs"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        <span>{tr('تعديل', 'Edit')}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 transition-colors"
                                                        title={tr('حذف التصنيف', 'Delete Category')}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Create/Edit Category */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-xs animate-in fade-in">
                    <div className="w-full max-w-lg rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                                {editingCategory ? tr('تعديل بيانات التصنيف', 'Edit Category Details') : tr('إضافة تصنيف جديد للمنصة', 'Add New Platform Category')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('اسم التصنيف', 'Category Name')}
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={tr('مثال: حقائب وإكسسوارات فاخرة', 'e.g. Luxury Handbags & Jewelry')}
                                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none"
                                    required
                                />
                                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('المعرف الرابط (Slug - اختياري)', 'Slug (Optional)')}
                                </label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="luxury-bags"
                                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    {tr('الوصف العام', 'Description')}
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    placeholder={tr('تشكيلة فاخرة من أرقى حقائب اليد والمجوهرات المصممة للمناسبات...', 'Exclusive luxury pieces for special occasions...')}
                                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-stone-300 dark:border-stone-700 text-stone-900 focus:ring-amber-500"
                                />
                                <label htmlFor="is_active" className="text-xs font-semibold text-stone-800 dark:text-stone-200 cursor-pointer">
                                    {tr('تفعيل وإظهار التصنيف في المتجر للجمهور وللأتيليهات', 'Activate and display this category in the public storefront and ateliers list')}
                                </label>
                            </div>

                            <div className="border-t border-stone-100 dark:border-stone-800 pt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                                >
                                    {tr('إلغاء', 'Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-stone-900 dark:bg-amber-600 px-5 py-2 text-xs font-bold text-amber-300 dark:text-white hover:bg-stone-800 dark:hover:bg-amber-500 transition-colors shadow-xs"
                                >
                                    {processing ? tr('جاري الحفظ…', 'Saving…') : editingCategory ? tr('تحديث التصنيف', 'Update Category') : tr('حفظ التصنيف', 'Save Category')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
