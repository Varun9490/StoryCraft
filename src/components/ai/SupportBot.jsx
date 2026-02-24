'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import SupportBotMessage from './SupportBotMessage';
import TypingIndicator from '@/components/chat/TypingIndicator';

export default function SupportBot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'model',
            content: "Namaste! I'm Kavya, your craft guide. Ask me anything — from finding the perfect Etikoppaka toy to understanding Bidriware metalwork. You can also send me a photo! 🎨",
            products: [],
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [imageMimeType, setImageMimeType] = useState(null);
    const messagesEndRef = useRef(null);
    const fileRef = useRef(null);

    // Hide on dashboard
    if (pathname?.startsWith('/dashboard')) return null;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImagePreview(URL.createObjectURL(file));
        setImageMimeType(file.type);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            setImageBase64(base64);
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setImagePreview(null);
        setImageBase64(null);
        setImageMimeType(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text && !imageBase64) return;
        if (isLoading) return;

        const userMsg = { role: 'user', content: text || '[Image sent]', products: [] };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const requestBody = {
            message: text || 'What craft is this?',
            sessionHistory: sessionHistory.slice(-12),
        };
        if (imageBase64) {
            requestBody.imageBase64 = imageBase64;
            requestBody.imageMimeType = imageMimeType;
        }
        clearImage();

        try {
            const res = await fetch('/api/ai/support-bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            const data = await res.json();
            if (data.success) {
                const botMsg = {
                    role: 'model',
                    content: data.data.response,
                    products: data.data.matchedProducts || [],
                };
                setMessages((prev) => [...prev, botMsg]);
                setSessionHistory((prev) => [
                    ...prev,
                    { role: 'user', content: text },
                    { role: 'model', content: data.data.response },
                ].slice(-12));
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'model', content: data.error || 'Sorry, I had trouble processing that. Try again!', products: [] },
                ]);
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'model', content: 'Oops! Connection issue. Let me try again in a moment.', products: [] },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen((o) => !o)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl z-50 hover:brightness-110 transition-all"
                style={{ background: '#C4622D' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={!isOpen ? { boxShadow: ['0 0 0 0px rgba(196,98,45,0.4)', '0 0 0 12px rgba(196,98,45,0)', '0 0 0 0px rgba(196,98,45,0.4)'] } : {}}
                transition={!isOpen ? { duration: 2, repeat: Infinity } : {}}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="text-xl">
                            ✕
                        </motion.span>
                    ) : (
                        <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="text-xl">
                            💬
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="fixed bottom-24 right-6 w-[360px] h-[480px] rounded-2xl overflow-hidden z-50 flex flex-col border border-white/10"
                        style={{
                            background: 'rgba(15,15,20,0.95)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2" style={{ background: 'rgba(196,98,45,0.1)' }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#C4622D', color: 'white' }}>
                                K
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-white/90">Kavya</p>
                                <p className="text-[9px] text-white/30">StoryCraft AI Assistant ✦</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                            {messages.map((msg, i) => (
                                <SupportBotMessage key={i} message={msg} />
                            ))}
                            <AnimatePresence>
                                {isLoading && <TypingIndicator userName="Kavya" />}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Image preview */}
                        {imagePreview && (
                            <div className="px-3 py-1 border-t border-white/5">
                                <div className="relative inline-block">
                                    <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                                    <button onClick={clearImage} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-3 py-2.5 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                </button>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask Kavya anything..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/90 placeholder:text-white/25 focus:border-[#C4622D] focus:outline-none transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={(!input.trim() && !imageBase64) || isLoading}
                                    className="p-1.5 rounded-lg text-white transition-all disabled:opacity-30 hover:brightness-110"
                                    style={{ background: input.trim() || imageBase64 ? '#C4622D' : 'transparent' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 2L11 13" />
                                        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
