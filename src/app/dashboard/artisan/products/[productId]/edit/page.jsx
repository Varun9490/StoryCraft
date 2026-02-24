'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductUploadForm from '@/components/dashboard/ProductUploadForm';

export default function EditProductPage({ params }) {
    const { productId } = use(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();
                if (data.success) setProduct(data.data.product);
            } catch { }
            setLoading(false);
        };
        fetchProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="max-w-3xl mx-auto space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                <div className="text-5xl mb-4 opacity-20">📦</div>
                <h1 className="text-xl text-white/50" style={{ fontFamily: 'var(--font-playfair)' }}>Product Not Found</h1>
                <Link href="/dashboard/artisan" className="text-sm mt-4 block" style={{ color: '#C4622D' }}>← Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Link href="/dashboard/artisan" className="text-xs text-white/30 hover:text-white/50 transition-colors mb-4 block">
                    ← Back to Dashboard
                </Link>
                <h1
                    className="text-2xl md:text-3xl font-bold text-white/90"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Edit Product
                </h1>
                <p className="text-sm text-white/40 mt-1">{product.title}</p>
            </motion.div>

            <ProductUploadForm existingProduct={product} />
        </div>
    );
}
