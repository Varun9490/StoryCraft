'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import PricingCard from './PricingCard';

export default function PricingRecommender({ productData, onPriceApply }) {
    const [loading, setLoading] = useState(false);
    const [pricingData, setPricingData] = useState(null);
    const [error, setError] = useState('');
    const [fromCache, setFromCache] = useState(false);

    const handleGetPricing = async () => {
        if (loading) return;
        setLoading(true);
        setError('');
        setPricingData(null);

        try {
            const res = await fetch('/api/ai/pricing-recommendation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: productData?.title || '',
                    description: productData?.description || '',
                    category: productData?.category || '',
                    city: productData?.city || 'Visakhapatnam',
                    material: productData?.material || '',
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Pricing data unavailable. Enter your price based on material cost + labor.');
                return;
            }

            setPricingData(data.data);
            setFromCache(data.data.from_cache);
        } catch (err) {
            setError('Could not reach AI service. Enter your price manually.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {!pricingData && (
                <motion.button
                    onClick={handleGetPricing}
                    disabled={loading}
                    whileHover={!loading ? { boxShadow: '0 0 16px rgba(232,168,56,0.2)' } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className={cn(
                        'w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border',
                        loading
                            ? 'bg-white/5 border-white/10 text-white/30 cursor-wait'
                            : 'bg-transparent border-[#E8A838]/40 text-[#E8A838] hover:bg-[#E8A838]/5 cursor-pointer'
                    )}
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/20 border-t-[#E8A838] rounded-full animate-spin" />
                            Searching competitor prices...
                        </>
                    ) : (
                        <>
                            <span className="text-lg">✦</span>
                            Get AI Pricing Insight
                        </>
                    )}
                </motion.button>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="rounded-2xl p-6 border border-white/10 bg-white/[0.02] animate-pulse">
                    <div className="h-4 w-1/3 bg-white/10 rounded mb-6" />
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="h-20 bg-white/5 rounded-xl" />
                        <div className="h-20 bg-white/5 rounded-xl" />
                    </div>
                    <div className="h-24 bg-white/5 rounded-xl mb-4" />
                    <div className="h-3 bg-white/5 rounded-full mb-4" />
                    <div className="h-10 bg-white/10 rounded-xl" />
                </div>
            )}

            {/* From cache badge */}
            {pricingData && fromCache && (
                <div className="text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30">
                        Cached — saves API credits
                    </span>
                </div>
            )}

            {/* Pricing card */}
            {pricingData && (
                <PricingCard
                    pricing={pricingData.pricing}
                    competitorCount={pricingData.competitor_count}
                    onApply={onPriceApply}
                />
            )}

            {/* Error */}
            {error && !loading && (
                <p className="text-xs text-amber-400 text-center bg-amber-500/10 rounded-lg py-2 px-3 border border-amber-500/20">
                    {error}
                </p>
            )}
        </div>
    );
}
