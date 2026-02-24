'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ImageMessageUpload from './ImageMessageUpload';
import Image from 'next/image';

export default function ChatInterface({ chatId, currentUser, otherParticipant, product }) {
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
        fetchChat();
    }, [chatId]);

    // Socket handlers
    useEffect(() => {
        if (!chatId || !currentUser?._id) return;
        joinChat(chatId, currentUser._id);

        const cleanupMsg = onNewMessage(({ message, chatId: incomingChatId }) => {
            if (incomingChatId === chatId) {
                setMessages((prev) => {
                    // Prevent duplicates
                    if (prev.some((m) => m._id === message._id)) return prev;
                    return [...prev, message];
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
        if (!text) return;

        sendMessage({
            chatId,
            senderId: currentUser._id,
            content: text,
            messageType: 'text',
        });

        // Optimistic add
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
    }, [newMessage, chatId, currentUser?._id]);

    const handleImageReady = useCallback(
        (imageUrl) => {
            sendMessage({
                chatId,
                senderId: currentUser._id,
                content: '',
                messageType: 'image',
                imageUrl,
            });
        },
        [chatId, currentUser?._id]
    );

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
        // Typing indicator
        emitTypingStart(chatId, currentUser._id);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            emitTypingStop(chatId, currentUser._id);
        }, 2000);
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
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="w-9 h-9 rounded-full bg-[#C4622D]/20 flex items-center justify-center text-sm font-bold" style={{ color: '#C4622D' }}>
                    {otherParticipant?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{otherParticipant?.name || 'User'}</p>
                    {product && (
                        <p className="text-[10px] text-white/30 truncate">Re: {product.title}</p>
                    )}
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500/70" title="Connected" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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
                        <p className="text-white/20 text-sm">Start a conversation</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg, i) => (
                            <MessageBubble
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
            <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02]">
                <div className="flex items-end gap-2">
                    <ImageMessageUpload onImageReady={handleImageReady} disabled={false} />
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/25 focus:border-[#C4622D] focus:outline-none resize-none transition-colors"
                        style={{ maxHeight: '96px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="p-2.5 rounded-xl text-white transition-all disabled:opacity-30 hover:brightness-110"
                        style={{ background: newMessage.trim() ? '#C4622D' : '#333' }}
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
