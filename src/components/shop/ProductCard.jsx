'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { Lens } from '@/components/animations/Lens';

export default function ProductCard({ product, index = 0 }) {
    const { dispatch } = useCart();
    const [added, setAdded] = useState(false);

    const artisanName =
        product.artisan?.user?.name || product.artisan?.name || 'Artisan';
    const imageUrl = product.images?.[0]?.url || '';
    const artisanId = product.artisan?._id || product.artisan?.user?._id;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                product: {
                    _id: product._id,
                    title: product.title,
                    price: product.price,
                    images: product.images,
                    stock: product.stock,
                    artisan: { _id: artisanId, name: artisanName },
                },
            },
        });
        dispatch({ type: 'SET_DRAWER', payload: true });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{ y: -6 }}
            className="group rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm"
        >
            <Link href={`/shop/${product._id}`} className="block">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#1A1209]">
                    <Lens zoomFactor={1.5} lensSize={150}>
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={product.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white/10 text-6xl">
                                🎨
                            </div>
                        )}
                        {/* City badge */}
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs bg-black/60 border border-white/20 text-white/70 backdrop-blur-sm z-10">
                            {product.city || 'Vizag'}
                        </span>

                        {/* Stock warning */}
                        {product.stock <= 3 && product.stock > 0 && (
                            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 z-10">
                                Only {product.stock} left
                            </span>
                        )}
                        {product.stock === 0 && (
                            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs bg-red-500/20 border border-red-500/40 text-red-300 z-10">
                                Out of Stock
                            </span>
                        )}
                    </Lens>
                </div>

                {/* Info */}
                <div className="p-4">
                    {product.craft_technique && (
                        <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">
                            {product.craft_technique}
                        </p>
                    )}
                    <h3
                        className="font-semibold text-white/90 text-sm leading-snug line-clamp-2"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        {product.title}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">by {artisanName}</p>

                    <div className="flex items-center justify-between mt-3">
                        <span
                            className="text-lg font-bold"
                            style={{ color: '#C4622D', fontFamily: 'var(--font-playfair)' }}
                        >
                            ₹{product.price?.toLocaleString('en-IN')}
                        </span>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${added
                                ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                                : product.stock === 0
                                    ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'
                                    : 'bg-white/10 border border-white/20 text-white/70 hover:bg-[#C4622D] hover:border-[#C4622D] hover:text-white'
                                }`}
                        >
                            {added ? '✓ Added' : product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
