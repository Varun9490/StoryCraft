'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FAQGeneratorTrigger({ productData, onFAQsGenerated, disabled = false }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [callCount, setCallCount] = useState(0);

    const canGenerate =
        !disabled &&
        productData?.title &&
        productData?.category &&
        productData?.description?.length >= 50;

    const tooltipText = !productData?.title
        ? 'Add a product title first'
        : !productData?.category
            ? 'Select a category first'
            : productData?.description?.length < 50
                ? `Description too short (${productData?.description?.length || 0}/50 chars min)`
                : '';

    const handleGenerate = async () => {
        if (!canGenerate || loading) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/ai/generate-faqs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: productData.title,
                    description: productData.description,
                    category: productData.category,
                    material: productData.material || '',
                    craft_technique: productData.craft_technique || '',
                    city: productData.city || 'Visakhapatnam',
                    productId: productData.productId || null,
                }),
            });

            const data = await res.json();

            if (res.status === 429) {
                setError('FAQ generation limit reached for this product (5/5)');
                return;
            }

            if (res.status === 422) {
                setError('AI returned an unexpected response. Try again in a moment.');
                return;
            }

            if (!data.success) {
                setError(data.error || 'Failed to generate FAQs');
                return;
            }

            setCallCount((c) => c + 1);
            onFAQsGenerated(data.data.faqs);
        } catch (err) {
            setError('Could not reach AI service. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <motion.button
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                whileHover={canGenerate && !loading ? { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' } : {}}
                whileTap={canGenerate && !loading ? { scale: 0.98 } : {}}
                className={cn(
                    'w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                    canGenerate && !loading
                        ? 'bg-[#8B5CF6] text-white hover:brightness-110 cursor-pointer'
                        : 'bg-white/10 text-white/30 cursor-not-allowed opacity-50'
                )}
            >
                {loading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating 8 FAQs...
                    </>
                ) : (
                    <>
                        <span className="text-lg">✦</span>
                        Generate FAQs with AI
                    </>
                )}
            </motion.button>

            {/* Tooltip for disabled state */}
            {tooltipText && !loading && (
                <p className="text-[10px] text-white/25 text-center">{tooltipText}</p>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-2 mt-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl bg-white/5 p-4 animate-pulse">
                            <div className="h-3 w-2/3 bg-white/10 rounded mb-2" />
                            <div className="h-2 w-full bg-white/5 rounded" />
                            <div className="h-2 w-4/5 bg-white/5 rounded mt-1" />
                        </div>
                    ))}
                </div>
            )}

            {/* Call count */}
            {callCount > 0 && (
                <p className="text-[10px] text-white/25 text-center">
                    AI generations used: {callCount}/5
                </p>
            )}

            {/* Error */}
            {error && (
                <p className="text-xs text-red-400 text-center bg-red-500/10 rounded-lg py-2 px-3 border border-red-500/20">
                    {error}
                </p>
            )}
        </div>
    );
}
