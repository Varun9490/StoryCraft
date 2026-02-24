'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function CartSummary({ compact = false }) {
    const { cartTotal, cartCount } = useCart();

    return (
        <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md ${compact ? 'p-4' : 'p-6'}`}>
            <h3
                className="text-lg font-semibold text-white/90 mb-4"
                style={{ fontFamily: 'var(--font-playfair)' }}
            >
                Order Summary
            </h3>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/60">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="text-white/90">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-white/60">
                    <span>Shipping</span>
                    <span className="text-green-400">Free</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between text-base font-bold">
                    <span className="text-white/90">Total</span>
                    <span style={{ color: '#C4622D', fontFamily: 'var(--font-playfair)' }}>
                        ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                </div>
            </div>

            {!compact && (
                <div className="mt-6 space-y-3">
                    <Link
                        href="/checkout"
                        className="block w-full text-center py-3 rounded-xl font-semibold text-white transition-all hover:brightness-110"
                        style={{
                            background: '#C4622D',
                            fontFamily: 'var(--font-inter)',
                            boxShadow: '0 4px 16px rgba(196,98,45,0.3)',
                        }}
                    >
                        Proceed to Checkout
                    </Link>
                    <Link
                        href="/shop"
                        className="block w-full text-center py-2.5 text-sm text-white/50 hover:text-white/80 transition-colors"
                    >
                        Continue Shopping →
                    </Link>
                </div>
            )}
        </div>
    );
}
