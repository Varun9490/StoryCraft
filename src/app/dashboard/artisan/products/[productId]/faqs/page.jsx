'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import FAQManager from '@/components/dashboard/FAQManager';

export default function FAQManagementPage({ params }) {
    const { productId } = use(params);
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();
                if (data.success) {
                    setProduct(data.data.product);
                }
            } catch (err) {
                console.error('Failed to load product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="h-6 w-2/3 bg-white/5 rounded animate-pulse mb-6" />
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-3xl mx-auto py-12 text-center">
                <p className="text-white/40 text-sm">Product not found</p>
                <Link href="/dashboard/artisan" className="text-sm mt-3 inline-block" style={{ color: '#C4622D' }}>
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto py-8 px-4"
        >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/30 mb-6">
                <Link href="/dashboard/artisan" className="hover:text-white/60 transition-colors">Dashboard</Link>
                <span>/</span>
                <Link href="/dashboard/artisan" className="hover:text-white/60 transition-colors">Products</Link>
                <span>/</span>
                <span className="text-white/50 truncate max-w-[150px]">{product.title}</span>
                <span>/</span>
                <span className="text-[#8B5CF6]">Manage FAQs</span>
            </div>

            {/* Back button */}
            <Link
                href="/dashboard/artisan"
                className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-6"
            >
                ← Back to Products
            </Link>

            {/* Title */}
            <h1
                className="text-2xl font-bold text-white/90 mb-2"
                style={{ fontFamily: 'var(--font-playfair)' }}
            >
                Manage AI FAQs
            </h1>
            <p className="text-sm text-white/40 mb-6">
                for <span className="text-white/60">{product.title}</span>
            </p>

            {/* Help callout */}
            <div className="rounded-xl p-4 bg-[#8B5CF6]/5 border border-[#8B5CF6]/15 mb-8">
                <div className="flex items-start gap-3">
                    <span className="text-[#8B5CF6] text-lg mt-0.5">✦</span>
                    <div>
                        <p className="text-sm text-white/60 font-medium mb-1">What are AI FAQs?</p>
                        <p className="text-xs text-white/40 leading-relaxed">
                            Gemini reads your product description and generates questions buyers typically ask.
                            You review and approve them — only approved FAQs appear on your product page.
                            This boosts buyer confidence and reduces pre-sale messages.
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQ Manager */}
            <FAQManager
                productId={productId}
                productData={{
                    title: product.title,
                    description: product.description,
                    category: product.category,
                    material: product.material,
                    craft_technique: product.craft_technique,
                    city: product.city,
                }}
            />
        </motion.div>
    );
}
