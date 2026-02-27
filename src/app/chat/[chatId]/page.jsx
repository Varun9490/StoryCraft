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
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    const [unapprovedPreviewUrl, setUnapprovedPreviewUrl] = useState(null);

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
                    // Find existing preview image from messages
                    const previewMsg = data.data.chat.messages?.findLast?.(
                        m => m.message_type === 'aipreview' && m.image_url
                    );
                    if (previewMsg) {
                        setPreviewImageUrl(previewMsg.image_url);
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
                setPreviewImageUrl(imageUrl);
                setGeneratingPreview(false);
                setGenerationLoading(false);
            }
        });
        const cleanupGenerating = onEvent('preview_generating', ({ chatId: incomingChatId }) => {
            if (incomingChatId === chatId) {
                setGeneratingPreview(true);
            }
        });
        const cleanupFailed = onEvent('preview_generation_failed', ({ chatId: incomingChatId }) => {
            if (incomingChatId === chatId) {
                setGeneratingPreview(false);
                setGenerationLoading(false);
            }
        });
        return () => {
            cleanupReady?.();
            cleanupGenerating?.();
            cleanupFailed?.();
        };
    }, [chatId]);

    const otherParticipant = chat?.participants?.find((p) => p._id !== user?._id);

    const handleGeneratePreview = async () => {
        if (!customizationPrompt.trim() || generationLoading) return;
        setGenerationLoading(true);
        try {
            // Resolve the product image URL properly
            const productImages = chat?.product?.images || [];
            let productImage = '';
            if (productImages.length > 0) {
                const firstImg = productImages[0];
                // Handle case where image is an object with url property, or a plain string
                productImage = typeof firstImg === 'string' ? firstImg : (firstImg?.url || firstImg?.secure_url || '');
            }

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
                setUnapprovedPreviewUrl(data.data.imageUrl);
            }
        } catch (err) {
            console.error('Preview generation failed:', err);
        } finally {
            setGenerationLoading(false);
        }
    };

    const handleApprovePreview = async () => {
        if (!unapprovedPreviewUrl) return;
        try {
            const res = await fetch(`/api/ai/approve-customization-preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId, imageUrl: unapprovedPreviewUrl }),
            });
            const data = await res.json();
            if (data.success) {
                setChat((prev) => prev ? { ...prev, customization_status: 'preview_generated' } : prev);
                setPreviewImageUrl(unapprovedPreviewUrl);
                setUnapprovedPreviewUrl(null);
            }
        } catch (err) {
            console.error('Failed to approve:', err);
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

    const handleRequestChanges = async () => {
        try {
            await fetch(`/api/chats/${chatId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customization_status: 'requested' }),
            });
            setChat((prev) => prev ? { ...prev, customization_status: 'requested' } : prev);
            setPreviewImageUrl(null);
        } catch (err) {
            console.error('Failed to request changes:', err);
        }
    };

    if (loading || authLoading || !user) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#050505]">
                <span className="w-6 h-6 border-2 border-white/10 border-t-[#C4622D] rounded-full animate-spin" />
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="h-screen flex items-center justify-center text-white/40 text-sm bg-[#050505]">
                Chat not found
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#050505]">
            {/* Customization Timeline */}
            {chat.customization_status !== 'none' && (
                <CustomizationTimeline status={chat.customization_status} />
            )}

            {/* Artisan: Generate Preview panel */}
            {chat.customization_status === 'requested' && user?.role === 'artisan' && (
                <div className="px-5 py-4 bg-[#E8A838]/[0.04] border-b border-[#E8A838]/15">
                    <p className="text-xs text-[#E8A838] font-medium mb-2.5 flex items-center gap-1.5">
                        <span>📝</span> Buyer requested a customization
                    </p>
                    <textarea
                        value={customizationPrompt}
                        onChange={(e) => setCustomizationPrompt(e.target.value)}
                        rows={2}
                        placeholder="Describe the customization for AI to generate..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white/90 placeholder:text-white/25 focus:border-[#8B5CF6]/50 focus:outline-none resize-none mb-3 transition-colors"
                    />
                    <button
                        onClick={handleGeneratePreview}
                        disabled={generationLoading || !customizationPrompt.trim()}
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-30 hover:brightness-110 shadow-md"
                        style={{ background: generationLoading ? '#555' : 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
                    >
                        {generationLoading ? '✦ Generating Preview...' : '✦ Generate AI Preview'}
                    </button>
                    {unapprovedPreviewUrl && (
                        <div className="mt-4 p-4 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 flex flex-col gap-3 sm:flex-row items-center">
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20 shrink-0">
                                <img src={unapprovedPreviewUrl} alt="Unapproved Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-white/90 font-medium mb-1">Preview Generated Successfully</p>
                                <p className="text-xs text-white/60 mb-3">Review the image before sending it to the buyer. If approved, it will be added to your product photos automatically.</p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleApprovePreview}
                                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#8B5CF6] text-white hover:brightness-110"
                                    >
                                        Approve & Send to Buyer
                                    </button>
                                    <button
                                        onClick={() => setUnapprovedPreviewUrl(null)}
                                        className="px-4 py-2 rounded-lg text-xs font-semibold border border-white/20 text-white/70 hover:bg-white/10"
                                    >
                                        Discard
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Preview card for buyer */}
            {chat.customization_status === 'preview_generated' && previewImageUrl && (
                <div className="px-4 py-3 border-b border-white/[0.06]">
                    <CustomizationPreviewCard
                        imageUrl={previewImageUrl}
                        chatId={chatId}
                        userRole={user?.role}
                        onConfirm={handleConfirmCustomization}
                        onRequestChanges={handleRequestChanges}
                    />
                </div>
            )}

            {/* Buyer: generating state */}
            {generatingPreview && user?.role === 'buyer' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-3 bg-[#8B5CF6]/[0.04] border-b border-[#8B5CF6]/15 text-center"
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
