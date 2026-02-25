'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

function WishlistSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/10 h-72 animate-pulse" />
            ))}
        </div>
    );
}

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await fetch('/api/wishlist');
            const data = await res.json();
            if (data.success) setWishlist(data.data.wishlist);
        } catch (err) {
            console.error('Failed to fetch wishlist:', err);
        }
        setLoading(false);
    };

    const removeFromWishlist = async (productId) => {
        setWishlist((prev) => prev.filter((p) => p._id !== productId));
        try {
            await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, action: 'remove' }),
            });
        } catch {
            fetchWishlist(); // revert
        }
    };

    return (
        <main className="min-h-screen bg-[#06060A] pt-8 pb-16">
            <div className="max-w-6xl mx-auto px-6">
                <div className="mb-8">
                    <h1
                        className="text-2xl md:text-3xl font-bold text-white/90"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Your Wishlist
                    </h1>
                    <p className="text-sm text-white/40 mt-1">Crafts that caught your eye ✨</p>
                </div>

                {loading ? (
                    <WishlistSkeleton />
                ) : wishlist.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="text-5xl mb-4 opacity-30">🤍</div>
                        <h3 className="text-lg font-medium text-white/60 mb-2">Your wishlist is empty</h3>
                        <p className="text-sm text-white/30 mb-4">Explore artisan crafts and save the ones you love.</p>
                        <Link
                            href="/shop"
                            className="inline-block px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                            style={{ background: '#C4622D' }}
                        >
                            Browse Shop
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((product, i) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-white/20 transition-all"
                            >
                                <Link href={`/shop/${product._id}`}>
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <Image
                                            src={product.images?.[0]?.url || product.images?.[0] || '/placeholder.jpg'}
                                            alt={product.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            sizes="(max-width: 768px) 100vw, 340px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-3 left-3">
                                            <span className="text-lg font-bold text-white">
                                                ₹{product.price?.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-4 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-white/80 truncate">{product.title}</h3>
                                        <p className="text-[11px] text-white/30 mt-0.5">
                                            {product.artisan?.craft_specialty || product.artisan?.city || 'Artisan Craft'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromWishlist(product._id)}
                                        className="flex-shrink-0 w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm hover:bg-red-500/20 transition-all"
                                    >
                                        ❤️
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
