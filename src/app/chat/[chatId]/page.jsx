'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import ChatInterface from '@/components/chat/ChatInterface';
import CustomizationTimeline from '@/components/customize/CustomizationTimeline';
import CustomizationPreviewCard from '@/components/customize/CustomizationPreviewCard';

export default function ChatDetailPage({ params }) {
    const { chatId } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { onEvent } = useSocket();
    const [chat, setChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatingPreview, setGeneratingPreview] = useState(false);
    const [customizationPrompt, setCustomizationPrompt] = useState('');
    const [generationLoading, setGenerationLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading]);

    useEffect(() => {
        const fetchChat = async () => {
            try {
                const res = await fetch(`/api/chats/${chatId}`);
                if (res.status === 403) {
                    router.push('/chat');
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    setChat(data.data.chat);
                    if (data.data.chat.customization_description) {
                        setCustomizationPrompt(data.data.chat.customization_description);
                    }
                }
            } catch (err) {
                console.error('Failed to load chat:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchChat();
    }, [chatId, user]);

    // Listen for preview events
    useEffect(() => {
        const cleanupReady = onEvent('preview_ready', ({ chatId: incomingChatId, imageUrl }) => {
            if (incomingChatId === chatId) {
                setChat((prev) => prev ? { ...prev, customization_status: 'preview_generated' } : prev);
                setGeneratingPreview(false);
            }
        });
        const cleanupGenerating = onEvent('preview_generating', ({ chatId: incomingChatId }) => {
            if (incomingChatId === chatId) {
                setGeneratingPreview(true);
            }
        });
        return () => {
            cleanupReady?.();
            cleanupGenerating?.();
        };
    }, [chatId]);

    const otherParticipant = chat?.participants?.find((p) => p._id !== user?._id);

    const handleGeneratePreview = async () => {
        if (!customizationPrompt.trim() || generationLoading) return;
        setGenerationLoading(true);
        try {
            const productImage = chat?.product?.images?.[0] || '';
            const res = await fetch('/api/ai/generate-customization-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId,
                    productImageUrl: productImage,
                    customizationPrompt: customizationPrompt.trim(),
                    referenceImageUrl: chat?.customization_reference_image || '',
                }),
            });
            const data = await res.json();
            if (data.success) {
                setChat((prev) => prev ? { ...prev, customization_status: 'preview_generated' } : prev);
            }
        } catch (err) {
            console.error('Preview generation failed:', err);
        } finally {
            setGenerationLoading(false);
        }
    };

    const handleConfirmCustomization = async () => {
        try {
            await fetch(`/api/chats/${chatId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customization_status: 'confirmed' }),
            });
            setChat((prev) => prev ? { ...prev, customization_status: 'confirmed' } : prev);
        } catch (err) {
            console.error('Failed to confirm:', err);
        }
    };

    if (loading || authLoading || !user) {
        return (
            <div className="h-screen flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-white/20 border-t-[#C4622D] rounded-full animate-spin" />
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="h-screen flex items-center justify-center text-white/40 text-sm">
                Chat not found
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Customization Timeline */}
            {chat.customization_status !== 'none' && (
                <CustomizationTimeline status={chat.customization_status} />
            )}

            {/* Artisan: Generate Preview button */}
            {chat.customization_status === 'requested' && user?.role === 'artisan' && (
                <div className="px-4 py-3 bg-[#E8A838]/5 border-b border-[#E8A838]/20">
                    <p className="text-xs text-[#E8A838] font-medium mb-2">📝 Buyer requested a customization</p>
                    <textarea
                        value={customizationPrompt}
                        onChange={(e) => setCustomizationPrompt(e.target.value)}
                        rows={2}
                        placeholder="Describe the customization..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 placeholder:text-white/25 focus:border-[#8B5CF6] focus:outline-none resize-none mb-2"
                    />
                    <button
                        onClick={handleGeneratePreview}
                        disabled={generationLoading || !customizationPrompt.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-30 hover:brightness-110"
                        style={{ background: '#8B5CF6' }}
                    >
                        {generationLoading ? '✦ Generating Preview...' : '✦ Generate AI Preview'}
                    </button>
                </div>
            )}

            {/* Buyer: generating state */}
            {generatingPreview && user?.role === 'buyer' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-3 bg-[#8B5CF6]/5 border-b border-[#8B5CF6]/20 text-center"
                >
                    <span className="w-4 h-4 border-2 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin inline-block mr-2" />
                    <span className="text-xs text-[#8B5CF6]">Artisan is generating your preview...</span>
                </motion.div>
            )}

            {/* Chat Interface */}
            <div className="flex-1 min-h-0">
                <ChatInterface
                    chatId={chatId}
                    currentUser={user}
                    otherParticipant={otherParticipant}
                    product={chat.product}
                />
            </div>
        </div>
    );
}
