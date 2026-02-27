'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function ChatListItem({ chat, currentUserId }) {
    const otherParticipant = chat.participants?.find(
        (p) => p._id !== currentUserId
    );

    const unreadCount = chat.messages?.filter(
        (m) => !m.read && m.sender !== currentUserId && m.sender?._id !== currentUserId
    ).length || 0;

    const timeAgo = chat.last_message_at
        ? formatTimeAgo(new Date(chat.last_message_at))
        : '';

    return (
        <Link href={`/chat/${chat._id}`}>
            <motion.div
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                className="flex items-center gap-3 px-4 py-3 border-b border-white/5 cursor-none transition-colors"
            >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                    style={{ background: 'rgba(196,98,45,0.2)', color: '#C4622D' }}
                >
                    {otherParticipant?.name?.[0] || '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white/80 truncate">
                            {otherParticipant?.name || 'User'}
                        </p>
                        <span className="text-[10px] text-white/20 flex-shrink-0">{timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {chat.product && (
                            <span className="text-[10px] text-white/30 truncate max-w-[100px]">
                                {chat.product.title}
                            </span>
                        )}
                        <span className="text-xs text-white/40 truncate">
                            {chat.last_message || 'No messages yet'}
                        </span>
                    </div>
                </div>

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: '#C4622D' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}

                {/* Customization status */}
                {chat.customization_status && chat.customization_status !== 'none' && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${chat.customization_status === 'requested'
                        ? 'bg-[#E8A838]/10 border-[#E8A838]/30 text-[#E8A838]'
                        : chat.customization_status === 'preview_generated'
                            ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6]'
                            : chat.customization_status === 'confirmed'
                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                : 'bg-white/5 border-white/10 text-white/30'
                        }`}>
                        {chat.customization_status === 'requested' ? '⏳ Awaiting'
                            : chat.customization_status === 'preview_generated' ? '✦ Preview'
                                : chat.customization_status === 'confirmed' ? '✓ Confirmed'
                                    : chat.customization_status}
                    </span>
                )}
            </motion.div>
        </Link>
    );
}

function formatTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
}
