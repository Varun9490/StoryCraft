'use client';

import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ImageMessageUpload from './ImageMessageUpload';

const MemoizedMessageBubble = memo(MessageBubble);

export default function ChatInterface({ chatId, currentUser, otherParticipant, product, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUser, setTypingUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);
    const textareaRef = useRef(null);
    const { joinChat, leaveChat, sendMessage, onNewMessage, onEvent, emitTypingStart, emitTypingStop } = useSocket();

    // Fetch chat history
    useEffect(() => {
        const fetchChat = async () => {
            try {
                const res = await fetch(`/api/chats/${chatId}`);
                const data = await res.json();
                if (data.success) {
                    setMessages(data.data.chat.messages || []);
                }
            } catch (err) {
                console.error('Failed to load chat:', err);
            } finally {
                setIsLoading(false);
            }
        };
        if (chatId) fetchChat();
    }, [chatId]);

    // Socket handlers
    useEffect(() => {
        if (!chatId || !currentUser?._id) return;
        joinChat(chatId, currentUser._id);

        const cleanupMsg = onNewMessage(({ message, chatId: incomingChatId }) => {
            if (incomingChatId === chatId) {
                setMessages((prev) => {
                    // Remove any temp message with same content from same sender (optimistic update)
                    const withoutTemp = prev.filter((m) => {
                        if (m._id?.startsWith?.('temp-') &&
                            m.sender === message.sender?.toString() &&
                            m.content === message.content) {
                            return false;
                        }
                        return true;
                    });
                    // Prevent duplicates by real _id
                    if (withoutTemp.some((m) => m._id === message._id)) return withoutTemp;
                    return [...withoutTemp, message];
                });
            }
        });

        const cleanupTypingStart = onEvent('typing_start', ({ userId }) => {
            if (userId !== currentUser._id) {
                setTypingUser(otherParticipant?.name || 'Someone');
            }
        });

        const cleanupTypingStop = onEvent('typing_stop', ({ userId }) => {
            if (userId !== currentUser._id) {
                setTypingUser(null);
            }
        });

        return () => {
            leaveChat(chatId);
            cleanupMsg?.();
            cleanupTypingStart?.();
            cleanupTypingStop?.();
        };
    }, [chatId, currentUser?._id]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUser]);

    const handleSend = useCallback(() => {
        const text = newMessage.trim();
        if (!text || !currentUser?._id) return;

        sendMessage({
            chatId,
            senderId: currentUser._id,
            content: text,
            messageType: 'text',
        });

        // Optimistic add — will be replaced by socket response
        setMessages((prev) => [
            ...prev,
            {
                _id: `temp-${Date.now()}`,
                sender: currentUser._id,
                content: text,
                message_type: 'text',
                createdAt: new Date().toISOString(),
            },
        ]);

        setNewMessage('');
        emitTypingStop(chatId, currentUser._id);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }, [newMessage, chatId, currentUser?._id, sendMessage, emitTypingStop]);

    const handleImageReady = useCallback(
        (imageUrl) => {
            if (!currentUser?._id) return;
            sendMessage({
                chatId,
                senderId: currentUser._id,
                content: '',
                messageType: 'image',
                imageUrl,
            });
        },
        [chatId, currentUser?._id, sendMessage]
    );

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
        if (currentUser?._id) {
            emitTypingStart(chatId, currentUser._id);
            clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => {
                emitTypingStop(chatId, currentUser._id);
            }, 2000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-gradient-to-r from-[#0f0f0f] to-[#141414]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C4622D] to-[#E8A838] flex items-center justify-center text-sm font-bold text-white shadow-md">
                    {otherParticipant?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{otherParticipant?.name || 'User'}</p>
                    {product && (
                        <p className="text-[10px] text-white/35 truncate">Re: {product.title}</p>
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors text-sm"
                    >
                        ✕
                    </button>
                )}
                <div className="w-2 h-2 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.4)]" title="Connected" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-hide">
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-12 rounded-2xl bg-white/5 animate-pulse ${i % 2 === 0 ? 'w-2/3' : 'w-1/2 ml-auto'}`}
                            />
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-3xl opacity-20 block mb-3">💬</span>
                        <p className="text-white/25 text-sm">Start a conversation</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <MemoizedMessageBubble
                                key={msg._id || `msg-${i}`}
                                message={msg}
                                isOwn={msg.sender === currentUser._id || msg.sender?._id === currentUser._id}
                                otherParticipant={otherParticipant}
                            />
                        ))}
                    </AnimatePresence>
                )}

                <AnimatePresence>
                    {typingUser && <TypingIndicator userName={typingUser} />}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/[0.08] bg-[#0e0e0e]">
                <div className="flex items-end gap-2">
                    <ImageMessageUpload onImageReady={handleImageReady} disabled={false} />
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/25 focus:border-[#C4622D]/60 focus:bg-white/[0.06] focus:outline-none resize-none transition-all"
                        style={{ maxHeight: '96px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="p-2.5 rounded-xl text-white transition-all disabled:opacity-20 hover:brightness-110 hover:scale-105 active:scale-95"
                        style={{ background: newMessage.trim() ? 'linear-gradient(135deg, #C4622D, #E8A838)' : '#222' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
