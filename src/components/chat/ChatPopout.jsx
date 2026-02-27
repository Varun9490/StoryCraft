'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatList from './ChatList';
import ChatInterface from './ChatInterface';
import { useAuth } from '@/hooks/useAuth';

const PANEL_VARIANTS = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { type: 'spring', stiffness: 320, damping: 28 }
    },
    exit: {
        opacity: 0, y: 24, scale: 0.96,
        transition: { duration: 0.2 }
    },
};

function ChatPopout() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Open a specific chat
    const openChat = useCallback(async (chatId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/chats/${chatId}`);
            const data = await res.json();
            if (data.success) {
                setChatData(data.data.chat);
                setActiveChat(chatId);
            }
        } catch (err) {
            console.error('Failed to load chat:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const closeChat = useCallback(() => {
        setActiveChat(null);
        setChatData(null);
    }, []);

    const otherParticipant = chatData?.participants?.find(p => p._id !== user?._id);

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={PANEL_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mb-4 rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.6)] flex flex-col"
                        style={{
                            width: '400px',
                            maxWidth: 'calc(100vw - 48px)',
                            height: '560px',
                            maxHeight: '75vh',
                            background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
                            backdropFilter: 'blur(32px)',
                        }}
                    >
                        {/* Top Bar */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-gradient-to-r from-[#141414] to-[#1a1a1a]">
                            <div className="flex items-center gap-3">
                                {activeChat && (
                                    <button
                                        onClick={closeChat}
                                        className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/50 hover:text-white/80 transition-all text-xs"
                                    >
                                        ←
                                    </button>
                                )}
                                <div>
                                    <h3 className="text-white/90 font-semibold text-sm tracking-tight">
                                        {activeChat
                                            ? (otherParticipant?.name || 'Chat')
                                            : 'Messages'
                                        }
                                    </h3>
                                    <p className="text-[10px] text-white/30 flex items-center gap-1">
                                        {activeChat
                                            ? (chatData?.product?.title ? `Re: ${chatData.product.title}` : 'Direct conversation')
                                            : (
                                                <>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/80 animate-pulse" />
                                                    Your conversations
                                                </>
                                            )
                                        }
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsOpen(false); closeChat(); }}
                                className="w-7 h-7 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <span className="w-6 h-6 border-2 border-white/10 border-t-[#C4622D] rounded-full animate-spin" />
                                </div>
                            ) : activeChat && chatData ? (
                                <ChatInterface
                                    chatId={activeChat}
                                    currentUser={user}
                                    otherParticipant={otherParticipant}
                                    product={chatData.product}
                                    onClose={closeChat}
                                />
                            ) : (
                                <div className="h-full overflow-y-auto">
                                    <ChatPopoutList
                                        currentUserId={user._id}
                                        onChatSelect={openChat}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(196,98,45,0.25)] transition-all duration-300 border border-white/[0.1] group"
                style={{
                    background: isOpen
                        ? 'linear-gradient(135deg, #1a1a1a, #222)'
                        : 'linear-gradient(135deg, #C4622D, #E8A838)',
                }}
            >
                {isOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0a0a0a] shadow-lg">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                )}
            </motion.button>
        </div>
    );
}

// Inline chat list specifically for the popout
function ChatPopoutList({ currentUserId, onChatSelect }) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch('/api/chats');
                const data = await res.json();
                if (data.success) setChats(data.data.chats);
            } catch (err) {
                console.error('Failed to load chats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    if (loading) {
        return (
            <div className="p-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-white/[0.03] animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-16 px-6">
                <span className="text-4xl opacity-15 block mb-4">💬</span>
                <p className="text-sm text-white/35 mb-2 text-center">No conversations yet</p>
                <p className="text-xs text-white/20 text-center">Browse crafts and start a conversation with an artisan</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-white/[0.04]">
            {chats.map((chat) => {
                const other = chat.participants?.find(p => p._id !== currentUserId);
                const unread = chat.messages?.filter(
                    m => !m.read && m.sender !== currentUserId && m.sender?._id !== currentUserId
                ).length || 0;

                return (
                    <motion.button
                        key={chat._id}
                        onClick={() => onChatSelect(chat._id)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors text-left"
                        whileHover={{ x: 2 }}
                    >
                        {/* Avatar */}
                        <div
                            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-md"
                            style={{
                                background: 'linear-gradient(135deg, rgba(196,98,45,0.25), rgba(232,168,56,0.15))',
                                color: '#E8A838',
                            }}
                        >
                            {other?.name?.[0] || '?'}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <p className="text-sm font-medium text-white/80 truncate">
                                    {other?.name || 'User'}
                                </p>
                                {chat.last_message_at && (
                                    <span className="text-[10px] text-white/20 flex-shrink-0 ml-2">
                                        {formatTimeAgo(new Date(chat.last_message_at))}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {chat.product && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/25 truncate max-w-[80px]">
                                        {chat.product.title}
                                    </span>
                                )}
                                <span className="text-xs text-white/30 truncate">
                                    {chat.last_message || 'No messages yet'}
                                </span>
                            </div>
                        </div>

                        {/* Unread + Status */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            {unread > 0 && (
                                <span
                                    className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-sm"
                                    style={{ background: '#C4622D' }}
                                >
                                    {unread > 9 ? '9+' : unread}
                                </span>
                            )}
                            {chat.customization_status && chat.customization_status !== 'none' && (
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${chat.customization_status === 'requested'
                                        ? 'bg-[#E8A838]/10 border-[#E8A838]/20 text-[#E8A838]'
                                        : chat.customization_status === 'preview_generated'
                                            ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20 text-[#8B5CF6]'
                                            : chat.customization_status === 'confirmed'
                                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                                : 'bg-white/5 border-white/10 text-white/30'
                                    }`}>
                                    {chat.customization_status === 'requested' ? '⏳'
                                        : chat.customization_status === 'preview_generated' ? '✦'
                                            : chat.customization_status === 'confirmed' ? '✓'
                                                : ''}
                                </span>
                            )}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}

function formatTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
}

export default memo(ChatPopout);
