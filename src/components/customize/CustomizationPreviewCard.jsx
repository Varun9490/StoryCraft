'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

function CustomizationPreviewCard({ imageUrl, chatId, userRole, onConfirm, onRequestChanges }) {
    if (!imageUrl) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-2xl overflow-hidden border-2 border-[#8B5CF6]/30 bg-[#8B5CF6]/5 max-w-sm mx-auto shadow-lg shadow-[#8B5CF6]/5"
        >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6]/10 border-b border-[#8B5CF6]/20">
                <span className="text-[#8B5CF6] text-sm">✦</span>
                <span className="text-xs font-semibold text-[#8B5CF6]">AI Customization Preview</span>
            </div>

            <div className="relative aspect-square bg-black/20">
                <img
                    src={imageUrl}
                    alt="Customization Preview"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {userRole === 'buyer' && (
                <div className="p-4 space-y-3">
                    <p className="text-xs text-white/50 text-center">
                        Your artisan created this preview for you. Does it match your vision?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-110 transition-all shadow-md"
                            style={{ background: 'linear-gradient(135deg, #52B788, #40916C)' }}
                        >
                            Looks Perfect! ✨
                        </button>
                        <button
                            onClick={onRequestChanges}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 border border-white/[0.08] hover:bg-white/[0.04] transition-colors"
                        >
                            Request Changes
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default memo(CustomizationPreviewCard);
