'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function CustomizationPreviewCard({ imageUrl, chatId, userRole, onConfirm, onRequestChanges }) {
    if (!imageUrl) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-2xl overflow-hidden border-2 border-[#8B5CF6]/30 bg-[#8B5CF6]/5 max-w-sm mx-auto"
        >
            <div className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/10 border-b border-[#8B5CF6]/20">
                <span className="text-[#8B5CF6] text-sm">✦</span>
                <span className="text-xs font-semibold text-[#8B5CF6]">AI Customization Preview</span>
            </div>

            <div className="relative aspect-square">
                <Image
                    src={imageUrl}
                    alt="Customization Preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 400px) 100vw, 400px"
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
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-110 transition-all"
                            style={{ background: '#52B788' }}
                        >
                            Looks Perfect! ✨
                        </button>
                        <button
                            onClick={onRequestChanges}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:bg-white/5 transition-colors"
                        >
                            Request Changes
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
