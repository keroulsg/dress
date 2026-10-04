import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { resolveImageUrl } from '@/Lib/utils';

interface WishlistDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
    const [items, setItems] = useState<any[]>([]);
    
    useEffect(() => {
        if (isOpen) {
            fetch('/wishlist')
                .then(res => res.json())
                .then(res => setItems(res.data || []))
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
            )}

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-canvas shadow-2xl z-50 transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-serif">Your Wishlist</h2>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-charcoal">&times;</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <p className="text-gray-500 text-center mt-12">Your wishlist is empty.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 group">
                                <Link href={`/dresses/${item.dress.slug}`} className="w-24 aspect-[3/4] bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    <img 
                                        src={resolveImageUrl(item.dress.primary_image?.image_path || item.dress.images?.[0]?.image_path) || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800'} 
                                        alt={item.dress.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                    />
                                </Link>
                                <div className="flex-1 flex flex-col">
                                    <p className="text-xs uppercase text-gray-500 tracking-wider mb-1">{item.dress.atelier?.business_name || item.dress.atelier?.name || 'Atelier'}</p>
                                    <Link href={`/dresses/${item.dress.slug}`} className="font-medium hover:text-gold transition-colors">{item.dress.title}</Link>
                                    <p className="mt-1 font-semibold">{item.dress.rental_price_per_day} SAR / day</p>
                                    <div className="mt-auto">
                                        <button className="text-xs text-rose underline hover:no-underline">Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
