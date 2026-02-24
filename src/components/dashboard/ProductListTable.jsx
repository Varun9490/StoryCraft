'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ProductListTable({ products: initialProducts }) {
    const [products, setProducts] = useState(initialProducts || []);

    const togglePublish = async (productId) => {
        try {
            const res = await fetch(`/api/products/${productId}/publish`, { method: 'PUT' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setProducts((prev) =>
                prev.map((p) => (p._id === productId ? { ...p, is_published: data.data.is_published } : p))
            );
            toast.success(data.message);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const deleteProduct = async (productId) => {
        if (!confirm('Delete this product? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setProducts((prev) => prev.filter((p) => p._id !== productId));
            toast.success('Product deleted');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                <div className="text-5xl mb-4 opacity-20">📦</div>
                <p className="text-white/40 text-sm mb-4">No products yet</p>
                <Link
                    href="/dashboard/artisan/products/new"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-110 transition-all"
                    style={{ background: '#C4622D' }}
                >
                    List Your First Product
                </Link>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-3 text-xs text-white/40 font-medium uppercase tracking-wider">Product</th>
                        <th className="text-left py-3 px-3 text-xs text-white/40 font-medium uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden sm:table-cell">Views</th>
                        <th className="text-left py-3 px-3 text-xs text-white/40 font-medium uppercase tracking-wider">Price</th>
                        <th className="text-left py-3 px-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden md:table-cell">FAQs</th>
                        <th className="text-right py-3 px-3 text-xs text-white/40 font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {products.map((product) => (
                            <motion.tr
                                key={product._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#1A1209] flex-shrink-0">
                                            {product.images?.[0]?.url ? (
                                                <Image src={product.images[0].url} alt="" fill className="object-cover" sizes="40px" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/10">🎨</div>
                                            )}
                                        </div>
                                        <span className="text-white/80 truncate max-w-[200px]">{product.title}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-3">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${product.is_published
                                            ? 'bg-green-500/15 border-green-500/40 text-green-400'
                                            : 'bg-white/5 border-white/10 text-white/40'
                                            }`}
                                    >
                                        {product.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="py-3 px-3 text-white/40 hidden sm:table-cell">{product.views || 0}</td>
                                <td className="py-3 px-3" style={{ color: '#C4622D' }}>₹{product.price?.toLocaleString('en-IN')}</td>
                                <td className="py-3 px-3 hidden md:table-cell">
                                    {(product.ai_generated_faqs?.length || 0) > 0 ? (
                                        <span className="text-[10px] text-white/30">
                                            {product.ai_generated_faqs.filter(f => f.approved).length}/{product.ai_generated_faqs.length} FAQs live
                                        </span>
                                    ) : (
                                        <Link
                                            href={`/dashboard/artisan/products/${product._id}/faqs`}
                                            className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
                                        >
                                            Add AI FAQs
                                        </Link>
                                    )}
                                </td>
                                <td className="py-3 px-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link
                                            href={`/dashboard/artisan/products/${product._id}/faqs`}
                                            className="p-1.5 rounded-lg text-[#8B5CF6]/50 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-colors"
                                            title="Manage FAQs"
                                        >
                                            ✦
                                        </Link>
                                        <Link
                                            href={`/dashboard/artisan/products/${product._id}/edit`}
                                            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
                                            title="Edit"
                                        >
                                            ✏️
                                        </Link>
                                        <button
                                            onClick={() => togglePublish(product._id)}
                                            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
                                            title={product.is_published ? 'Unpublish' : 'Publish'}
                                        >
                                            {product.is_published ? '📤' : '📥'}
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product._id)}
                                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div >
    );
}
