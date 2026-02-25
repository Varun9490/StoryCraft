'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Namaste! I am Kala, your artisan assistant. How can I help you discover handcrafted art today?' }
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
                    history: messages.slice(1), // Exclude initial greeting from formal history if desired, or keep it
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
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="mb-4 w-80 sm:w-96 rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-[#0a0a0a]/80 flex flex-col"
                        style={{ height: '500px', maxHeight: '70vh' }}
                    >
                        {/* Header */}
                        <div className="bg-[#1a1a1a]/80 backdrop-blur-md px-5 py-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#C4622D] to-[#8B5CF6] flex items-center justify-center shadow-lg">
                                    <span className="text-white text-sm font-bold tracking-tight">K</span>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="text-white font-medium text-sm">Kala</h3>
                                    <p className="text-white/40 text-[10px] flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse"></span>
                                        AI Artisan Assistant
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed relative ${msg.role === 'user'
                                                ? 'bg-[#C4622D] text-white rounded-br-sm shadow-md'
                                                : 'bg-white/5 text-white/90 border border-white/10 rounded-bl-sm backdrop-blur-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white/5 text-white/50 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm backdrop-blur-sm flex gap-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-[#1a1a1a]/40 border-t border-white/5 backdrop-blur-md">
                            <form
                                onSubmit={handleSend}
                                className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-1 pl-4 focus-within:border-white/20 focus-within:bg-white/10 transition-colors"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask Kala a question..."
                                    className="flex-1 bg-transparent text-white/90 text-sm placeholder:text-white/30 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ↑
                                </button>
                            </form>
                            <div className="mt-2 text-center">
                                <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">
                                    Powered by Gemini AI ✦
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Bubble Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 backdrop-blur-xl border border-white/20 ${isOpen
                        ? 'bg-white/10 text-white/80 rotate-180'
                        : 'bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white hover:border-[#C4622D]/50 group'
                    }`}
                style={{ zIndex: 90 }}
            >
                {isOpen ? (
                    <span className="text-xl">↓</span>
                ) : (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <span className="text-xl group-hover:-translate-y-0.5 transition-transform duration-300">✦</span>
                        <div className="absolute top-0 w-full h-full rounded-full border border-[#8B5CF6]/30 animate-ping opacity-30"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-[#1a1a1a] shadow-lg"></div>
                    </div>
                )}
            </motion.button>
        </div>
    );
}
