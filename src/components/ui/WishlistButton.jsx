'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WishlistButton({ productId, size = 'md' }) {
    const [wishlisted, setWishlisted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkWishlist = async () => {
            try {
                const res = await fetch('/api/wishlist');
                const data = await res.json();
                if (data.success) {
                    const isIn = data.data.wishlist.some(
                        (p) => (p._id || p) === productId
                    );
                    setWishlisted(isIn);
                }
            } catch { }
        };
        checkWishlist();
    }, [productId]);

    const toggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (loading) return;

        // Optimistic toggle
        setWishlisted(!wishlisted);
        setLoading(true);

        try {
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    action: wishlisted ? 'remove' : 'add',
                }),
            });
            const data = await res.json();
            if (!data.success) {
                setWishlisted(wishlisted); // revert
            }
        } catch {
            setWishlisted(wishlisted); // revert
        } finally {
            setLoading(false);
        }
    };

    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-lg',
        lg: 'w-12 h-12 text-xl',
    };

    return (
        <motion.button
            onClick={toggle}
            whileTap={{ scale: 0.85 }}
            className={`${sizes[size]} rounded-full flex items-center justify-center transition-all ${wishlisted
                    ? 'bg-red-500/20 border border-red-500/40'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <motion.span
                key={wishlisted ? 'filled' : 'empty'}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
                {wishlisted ? '❤️' : '🤍'}
            </motion.span>
        </motion.button>
    );
}
