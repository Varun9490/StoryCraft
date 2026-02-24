'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';

export default function FeaturedProductsSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products/featured')
            .then((r) => r.json())
            .then((data) => {
                if (data.success) setProducts(data.data.products);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="py-24 px-6 bg-[#050505]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="aspect-[4/5] rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-24 px-6 bg-[#050505] relative" id="featured-products">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <h2
                        className="text-4xl md:text-5xl font-bold text-white/90 mb-4"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Most Loved Crafts
                    </h2>
                    <p className="text-white/40 max-w-lg mx-auto text-sm">
                        The most viewed and cherished pieces from our community of artisans.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map((product, i) => (
                        <ProductCard key={product._id} product={product} index={i} />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/shop"
                        className="inline-block px-8 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-[#C4622D] hover:border-[#C4622D] hover:text-white"
                        style={{ borderColor: '#C4622D', color: '#C4622D' }}
                    >
                        Explore All Crafts →
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
