'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

function GlobalChatbot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Namaste! I am Kala, your artisan assistant. How can I help you discover handcrafted art today? ✨' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    if (pathname?.startsWith('/story/')) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const res = await fetch('/api/ai/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.slice(1),
                }),
            });

            const data = await res.json();
            if (data.success) {
                setMessages((prev) => [...prev, { role: 'assistant', content: data.data.reply }]);
            } else {
                setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to my creative mind right now.' }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { role: 'assistant', content: 'There seems to be a network interference. Please try again soon.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-[100] flex flex-col font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="mb-4 rounded-2xl overflow-hidden border border-white/[0.08] flex flex-col"
                        style={{
                            width: '360px',
                            maxWidth: 'calc(100vw - 120px)',
                            height: '500px',
                            maxHeight: '70vh',
                            background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
                            backdropFilter: 'blur(32px)',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.05)',
                        }}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-[#141414] to-[#1a1a1a]">
                            <div className="flex items-center gap-3">
                                <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#C4622D] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#C4622D]/20">
                                    <span className="text-white text-sm font-bold">K</span>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#141414] rounded-full" />
                                </div>
                                <div>
                                    <h3 className="text-white/90 font-semibold text-sm">Kala</h3>
                                    <p className="text-white/30 text-[10px] flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
                                        AI Artisan Assistant
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-7 h-7 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed relative ${msg.role === 'user'
                                            ? 'rounded-2xl rounded-br-md text-white shadow-md'
                                            : 'rounded-2xl rounded-bl-md text-white/90 border border-white/[0.08]'
                                            }`}
                                        style={{
                                            background: msg.role === 'user'
                                                ? 'linear-gradient(135deg, #C4622D, #b5561f)'
                                                : 'rgba(255,255,255,0.03)',
                                        }}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white/[0.04] text-white/50 border border-white/[0.08] px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/[0.05] bg-[#0e0e0e]">
                            <form
                                onSubmit={handleSend}
                                className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full p-1 pl-4 focus-within:border-white/[0.15] focus-within:bg-white/[0.06] transition-all"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask Kala a question..."
                                    className="flex-1 bg-transparent text-white/90 text-sm placeholder:text-white/25 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    style={{
                                        background: input.trim()
                                            ? 'linear-gradient(135deg, #C4622D, #E8A838)'
                                            : 'rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </form>
                            <div className="mt-2 text-center">
                                <span className="text-[9px] text-white/15 uppercase tracking-widest font-mono">
                                    Powered by Gemini AI ✦
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border border-white/[0.1] group"
                style={{
                    background: isOpen
                        ? 'linear-gradient(135deg, #1a1a1a, #222)'
                        : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                    boxShadow: isOpen
                        ? '0 4px 16px rgba(0,0,0,0.3)'
                        : '0 8px 32px rgba(139,92,246,0.3)',
                    zIndex: 90,
                }}
            >
                {isOpen ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold group-hover:-translate-y-0.5 transition-transform">✦</span>
                    </div>
                )}
            </motion.button>
        </div>
    );
}

export default memo(GlobalChatbot);
