'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function MessageBubble({ message, isOwn, otherParticipant }) {
    const isImage = message.message_type === 'image' && message.image_url;
    const isAiPreview = message.message_type === 'aipreview' && message.image_url;
    const isCustomizationRequest = message.message_type === 'customization_request';

    const time = new Date(message.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (isAiPreview) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm mx-auto my-3"
            >
                <div className="rounded-2xl overflow-hidden border-2 border-[#8B5CF6]/30 bg-[#8B5CF6]/5">
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#8B5CF6]/10 border-b border-[#8B5CF6]/20">
                        <span className="text-[#8B5CF6] text-xs">✦</span>
                        <span className="text-xs font-medium text-[#8B5CF6]">AI Customization Preview</span>
                    </div>
                    <div className="relative aspect-square">
                        <Image
                            src={message.image_url}
                            alt="AI Preview"
                            fill
                            className="object-cover"
                            sizes="320px"
                        />
                    </div>
                    <p className="text-[10px] text-white/30 px-3 py-1.5 text-center">{time}</p>
                </div>
            </motion.div>
        );
    }

    if (isCustomizationRequest) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[80%] ${isOwn ? 'self-end' : 'self-start'}`}
            >
                <div className="rounded-2xl p-4 border" style={{
                    background: 'rgba(232,168,56,0.1)',
                    borderColor: 'rgba(232,168,56,0.3)',
                }}>
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#E8A838' }}>
                        Customization Request
                    </span>
                    <p className="text-sm text-white/80 mt-1.5">{message.content}</p>
                    {message.image_url && (
                        <div className="mt-2 relative h-32 rounded-lg overflow-hidden">
                            <Image src={message.image_url} alt="Reference" fill className="object-cover" sizes="240px" />
                        </div>
                    )}
                    <p className="text-[10px] text-white/20 mt-2">{time}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`max-w-[75%] px-4 py-2 ${isOwn
                    ? 'rounded-2xl rounded-tr-sm text-white'
                    : 'rounded-2xl rounded-tl-sm text-white/80 border border-white/10'
                    }`}
                style={{
                    background: isOwn
                        ? '#C4622D'
                        : 'rgba(255,255,255,0.05)',
                }}
            >
                {isImage ? (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden mb-1">
                        <Image src={message.image_url} alt="Shared image" fill className="object-cover" sizes="300px" />
                    </div>
                ) : null}
                {message.content && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
                <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/50' : 'text-white/20'}`}>{time}</p>
            </div>
        </motion.div>
    );
}
