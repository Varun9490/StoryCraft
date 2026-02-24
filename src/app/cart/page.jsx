'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
    const { items, dispatch, cartCount } = useCart();

    return (
        <main className="min-h-screen bg-[#050505] pt-24">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1
                        className="text-3xl md:text-4xl font-bold text-white/90 mb-2"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Your Cart
                    </h1>
                    <p className="text-sm text-white/40 mb-8">
                        {cartCount > 0
                            ? `${cartCount} item${cartCount > 1 ? 's' : ''} ready for their new home`
                            : 'Your cart is empty'}
                    </p>
                </motion.div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                        <div className="text-7xl mb-6 opacity-20">🛒</div>
                        <h3 className="text-xl text-white/50 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                            Nothing here yet
                        </h3>
                        <p className="text-sm text-white/30 mb-6">Discover handcrafted treasures from our artisan community.</p>
                        <Link
                            href="/shop"
                            className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                            style={{ background: '#C4622D', boxShadow: '0 4px 16px rgba(196,98,45,0.3)' }}
                        >
                            Start Shopping →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Items */}
                        <div className="lg:col-span-2 space-y-3">
                            <AnimatePresence mode="popLayout">
                                {items.map((item) => (
                                    <CartItem key={item.product._id} item={item} />
                                ))}
                            </AnimatePresence>

                            <div className="flex items-center justify-between pt-4">
                                <Link href="/shop" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                                    ← Continue Shopping
                                </Link>
                                <button
                                    onClick={() => dispatch({ type: 'CLEAR_CART' })}
                                    className="text-sm text-red-400/60 hover:text-red-400 transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="lg:sticky lg:top-28 self-start">
                            <CartSummary />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
