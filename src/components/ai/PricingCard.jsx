'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function PricingCard({ pricing, competitorCount, onApply }) {
    if (!pricing) return null;

    const { market_range, suggested_price, margin_breakdown, reasoning, confidence } = pricing;

    const confidenceConfig = {
        high: { color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30', label: 'High Confidence' },
        medium: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', label: 'Medium Confidence' },
        low: { color: 'text-white/40', bg: 'bg-white/10', border: 'border-white/20', label: 'Low Confidence — Enter manually' },
    };
    const conf = confidenceConfig[confidence] || confidenceConfig.medium;

    const segments = [
        { label: 'Material', pct: margin_breakdown?.material_cost_pct || 0, color: 'bg-[#E8A838]' },
        { label: 'Labor', pct: margin_breakdown?.artisan_labor_pct || 0, color: 'bg-[#C4622D]' },
        { label: 'Platform', pct: margin_breakdown?.platform_fee_pct || 8, color: 'bg-[#8B5CF6]' },
        { label: 'Profit', pct: margin_breakdown?.profit_pct || 0, color: 'bg-green-500' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-2xl p-6 border bg-white/[0.03] backdrop-blur border-white/10"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#8B5CF6]">✦</span>
                    <span className="text-xs text-white/50 uppercase tracking-wider font-medium">AI Pricing Analysis</span>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', conf.bg, conf.border, conf.color)}>
                    {conf.label}
                </span>
            </div>

            {/* Market range */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 rounded-xl bg-white/5">
                    <p className="text-2xl font-bold text-green-400" style={{ fontFamily: 'var(--font-playfair)' }}>
                        ₹{market_range?.min?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Market Min</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                    <p className="text-2xl font-bold text-red-400" style={{ fontFamily: 'var(--font-playfair)' }}>
                        ₹{market_range?.max?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Market Max</p>
                </div>
            </div>
            {competitorCount > 0 && (
                <p className="text-[10px] text-white/20 text-center -mt-4 mb-4">
                    Based on {competitorCount} competitor listings
                </p>
            )}

            {/* Suggested price */}
            <div className="text-center py-4 mb-6 rounded-xl bg-[#C4622D]/10 border border-[#C4622D]/20">
                <p className="text-4xl font-bold" style={{ color: '#C4622D', fontFamily: 'var(--font-playfair)' }}>
                    ₹{suggested_price?.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-white/40 mt-1">Suggested Fair Price</p>
            </div>

            {/* Margin breakdown bar */}
            <div className="mb-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Margin Breakdown</p>
                <div className="h-3 rounded-full overflow-hidden flex bg-white/5">
                    {segments.map((seg) => (
                        <motion.div
                            key={seg.label}
                            className={cn('h-full', seg.color)}
                            initial={{ width: 0 }}
                            animate={{ width: `${seg.pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-1.5">
                    {segments.map((seg) => (
                        <div key={seg.label} className="flex items-center gap-1">
                            <div className={cn('w-2 h-2 rounded-full', seg.color)} />
                            <span className="text-[9px] text-white/30">{seg.label} {seg.pct}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reasoning */}
            {reasoning && (
                <p className="text-xs text-white/40 italic mb-5 leading-relaxed" style={{ fontFamily: 'var(--font-space)' }}>
                    "{reasoning}"
                </p>
            )}

            {/* Apply button */}
            <motion.button
                onClick={() => onApply(suggested_price)}
                whileHover={{ boxShadow: '0 0 20px rgba(196,98,45,0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:brightness-110"
                style={{ background: '#C4622D' }}
            >
                Apply This Price
            </motion.button>
        </motion.div>
    );
}
