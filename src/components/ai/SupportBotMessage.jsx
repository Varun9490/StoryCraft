'use client';

import { motion } from 'framer-motion';
import SupportBotProductResult from './SupportBotProductResult';

export default function SupportBotMessage({ message }) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className="max-w-[85%] space-y-2">
                {!isUser && (
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                            style={{ background: '#C4622D', color: 'white' }}>
                            K
                        </div>
                        <span className="text-[9px] text-white/30">Kavya</span>
                    </div>
                )}
                <div
                    className={`px-3.5 py-2.5 text-xs leading-relaxed ${isUser
                            ? 'rounded-2xl rounded-tr-sm text-white'
                            : 'rounded-2xl rounded-tl-sm text-white/80 border border-white/10'
                        }`}
                    style={{
                        background: isUser ? '#C4622D' : 'rgba(255,255,255,0.05)',
                    }}
                >
                    {message.content}
                </div>

                {/* Product results */}
                {message.products?.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {message.products.map((p) => (
                            <SupportBotProductResult key={p._id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
