'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';

export default function CartItem({ item }) {
    const { dispatch } = useCart();
    const { product, quantity } = item;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/10"
        >
            {/* Image */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#1A1209]">
                {product.images?.[0]?.url ? (
                    <Image
                        src={product.images[0].url}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl">🎨</div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4
                    className="text-sm font-semibold text-white/90 truncate"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    {product.title}
                </h4>
                {product.artisan?.name && (
                    <p className="text-xs text-white/40 mt-0.5">by {product.artisan.name}</p>
                )}
                <p className="text-sm font-semibold mt-1" style={{ color: '#C4622D' }}>
                    ₹{product.price?.toLocaleString('en-IN')}
                </p>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() =>
                            dispatch({
                                type: 'UPDATE_QUANTITY',
                                payload: { productId: product._id, quantity: quantity - 1 },
                            })
                        }
                        className="w-6 h-6 rounded-md bg-white/10 text-white/60 hover:bg-white/20 flex items-center justify-center text-sm transition-colors"
                    >
                        −
                    </button>
                    <span className="text-sm text-white/80 w-6 text-center">{quantity}</span>
                    <button
                        onClick={() =>
                            dispatch({
                                type: 'UPDATE_QUANTITY',
                                payload: { productId: product._id, quantity: quantity + 1 },
                            })
                        }
                        className="w-6 h-6 rounded-md bg-white/10 text-white/60 hover:bg-white/20 flex items-center justify-center text-sm transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Remove */}
            <button
                onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: product._id })}
                className="self-start p-1 text-white/30 hover:text-red-400 transition-colors"
                aria-label="Remove item"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
}
