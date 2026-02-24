'use client';

import { motion } from 'framer-motion';

export default function AnalysisResultCard({ analysis, onApply }) {
    if (!analysis) return null;

    const confidenceColors = {
        high: { bg: 'rgba(82,183,136,0.15)', border: 'rgba(82,183,136,0.3)', text: '#52B788' },
        medium: { bg: 'rgba(232,168,56,0.15)', border: 'rgba(232,168,56,0.3)', text: '#E8A838' },
        low: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#EF4444' },
    };
    const conf = confidenceColors[analysis.confidence] || confidenceColors.medium;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-5 space-y-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[#8B5CF6]">✦</span>
                    <h4 className="text-sm font-semibold text-white/80">AI Vision Analysis</h4>
                </div>
                <span
                    className="text-[10px] px-2 py-0.5 rounded-full border"
                    style={{ background: conf.bg, borderColor: conf.border, color: conf.text }}
                >
                    {analysis.confidence} confidence
                </span>
            </div>

            {/* Craft type & material */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Craft Type</span>
                    <span className="text-sm text-white/80 font-medium px-2.5 py-1 rounded-lg inline-block"
                        style={{ background: 'rgba(196,98,45,0.15)', color: '#C4622D' }}>
                        {analysis.craft_type}
                    </span>
                </div>
                <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Material</span>
                    <p className="text-sm text-white/70">{analysis.material}</p>
                </div>
            </div>

            {/* Region */}
            {analysis.region_origin && (
                <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Region of Origin</span>
                    <p className="text-sm text-white/70">{analysis.region_origin}</p>
                </div>
            )}

            {/* Color palette */}
            {analysis.color_palette?.length > 0 && (
                <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider block mb-2">Color Palette</span>
                    <div className="flex gap-2">
                        {analysis.color_palette.map((color, i) => (
                            <div
                                key={i}
                                className="w-8 h-8 rounded-full border-2 border-white/10"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Suggested title */}
            <div>
                <span className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Suggested Title</span>
                <p className="text-sm text-white/80 font-medium">{analysis.suggested_title}</p>
            </div>

            {/* Suggested description preview */}
            <div>
                <span className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Suggested Description</span>
                <p className="text-xs text-white/50 line-clamp-3 leading-relaxed">{analysis.suggested_description}</p>
            </div>

            {/* Tags */}
            {analysis.suggested_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {analysis.suggested_tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Apply button */}
            <button
                onClick={() => onApply(analysis)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-110 transition-all"
                style={{ background: '#8B5CF6' }}
            >
                ✦ Apply to Form
            </button>
        </motion.div>
    );
}
