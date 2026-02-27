'use client';

import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import CartItem from './CartItem';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function CartDrawer() {
    const { items, isOpen, dispatch, cartTotal, cartCount } = useCart();
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (!isOpen || items.length === 0) return;

        const fetchSuggestions = async () => {
            try {
                // Get unique categories from items in cart
                const categories = [...new Set(items.map(i => i.product.category).filter(Boolean))];
                if (categories.length === 0) return;

                // Just fetch based on the first category for simplicity
                const res = await fetch(`/api/products?category=${categories[0]}&limit=3`, { cache: 'no-store' });
                const data = await res.json();
                if (data.success) {
                    const cartProductIds = items.map(i => i.product._id);
                    setSuggestions(data.data.products.filter(p => !cartProductIds.includes(p._id)).slice(0, 2));
                }
            } catch (err) { }
        };

        fetchSuggestions();
    }, [isOpen, items]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => dispatch({ type: 'SET_DRAWER', payload: false })}
                        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 bottom-0 z-[10000] w-full max-w-md bg-[#0a0a0a] border-l border-white/10 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <h2
                                className="text-xl font-bold text-white/90"
                                style={{ fontFamily: 'var(--font-playfair)' }}
                            >
                                Your Cart
                                {cartCount > 0 && (
                                    <span className="ml-2 text-sm font-normal text-white/40">
                                        ({cartCount})
                                    </span>
                                )}
                            </h2>
                            <button
                                onClick={() => dispatch({ type: 'SET_DRAWER', payload: false })}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                aria-label="Close cart"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="text-5xl mb-4 opacity-30">🛍️</div>
                                    <p className="text-white/40 text-sm">Your cart is empty</p>
                                    <Link
                                        href="/shop"
                                        onClick={() => dispatch({ type: 'SET_DRAWER', payload: false })}
                                        className="mt-4 text-sm font-medium transition-colors"
                                        style={{ color: '#C4622D' }}
                                    >
                                        Start discovering crafts →
                                    </Link>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {items.map((item) => (
                                        <CartItem key={item.product._id} item={item} />
                                    ))}
                                </AnimatePresence>
                            )}

                            {/* Cart Suggestions */}
                            {items.length > 0 && suggestions.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <p className="text-xs text-white/50 uppercase tracking-wider mb-4 font-medium">You might also like</p>
                                    <div className="space-y-3">
                                        {suggestions.map((p) => (
                                            <div key={p._id} className="flex gap-3 items-center bg-white/[0.02] p-2 rounded-xl border border-white/5">
                                                <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0 bg-[#111]">
                                                    <Image
                                                        src={p.images[0]?.url || p.images[0] || '/placeholder.png'}
                                                        alt={p.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="48px"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/shop/${p._id}`} onClick={() => dispatch({ type: 'SET_DRAWER', payload: false })} className="text-sm text-white/90 font-medium truncate block hover:text-[#C4622D] transition-colors">
                                                        {p.title}
                                                    </Link>
                                                    <p className="text-xs text-[#C4622D]">₹{p.price}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        dispatch({
                                                            type: 'ADD_ITEM',
                                                            payload: { product: { _id: p._id, title: p.title, price: p.price, images: p.images, stock: p.stock, artisan: p.artisan } }
                                                        });
                                                    }}
                                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center shrink-0 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-5 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/60 text-sm">Subtotal</span>
                                    <span
                                        className="text-lg font-bold"
                                        style={{ color: '#C4622D', fontFamily: 'var(--font-playfair)' }}
                                    >
                                        ₹{cartTotal.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <Link
                                    href="/checkout"
                                    onClick={() => dispatch({ type: 'SET_DRAWER', payload: false })}
                                    className="block w-full text-center py-3 rounded-xl font-semibold text-white transition-all hover:brightness-110"
                                    style={{
                                        background: '#C4622D',
                                        fontFamily: 'var(--font-inter)',
                                        boxShadow: '0 4px 16px rgba(196,98,45,0.3)',
                                    }}
                                >
                                    Checkout
                                </Link>
                                <Link
                                    href="/cart"
                                    onClick={() => dispatch({ type: 'SET_DRAWER', payload: false })}
                                    className="block w-full text-center py-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                                >
                                    View Full Cart
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
