'use client';

import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MiniCartIcon() {
    const { cartCount, dispatch } = useCart();

    return (
        <button
            id="mini-cart-icon"
            onClick={() => dispatch({ type: 'TOGGLE_DRAWER' })}
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Open cart"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
            </svg>
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.span
                        key={cartCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold leading-none"
                        style={{ background: '#C4622D', color: '#fff' }}
                    >
                        {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
