'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StoryRenderer from '@/components/story/StoryRenderer';

export default function StoryViewerPage({ params }) {
    const { productId } = use(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [storyEnded, setStoryEnded] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();
                if (data.success) setProduct(data.data.product);
            } catch { }
            setLoading(false);
        };
        if (productId) load();
    }, [productId]);

    const enterFullscreen = useCallback(async () => {
        try {
            const el = document.documentElement;
            if (el.requestFullscreen) await el.requestFullscreen();
            else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
            else if (el.msRequestFullscreen) await el.msRequestFullscreen();
            setIsFullscreen(true);
        } catch { }
        setShowFullscreenPrompt(false);
    }, []);

    const exitFullscreen = useCallback(async () => {
        try {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
            else if (document.msExitFullscreen) await document.msExitFullscreen();
            setIsFullscreen(false);
        } catch { }
        setStoryEnded(false);
    }, []);

    const skipFullscreen = () => {
        setShowFullscreenPrompt(false);
    };

    useEffect(() => {
        const handler = () => {
            const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
            setIsFullscreen(isFull);
        };
        document.addEventListener('fullscreenchange', handler);
        document.addEventListener('webkitfullscreenchange', handler);
        return () => {
            document.removeEventListener('fullscreenchange', handler);
            document.removeEventListener('webkitfullscreenchange', handler);
        };
    }, []);

    useEffect(() => {
        if (!product?.story_panels?.length) return;
        const onScroll = () => {
            const scrolled = window.scrollY + window.innerHeight;
            const total = document.documentElement.scrollHeight;
            if (total - scrolled < 100 && isFullscreen && !storyEnded) {
                setStoryEnded(true);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [product, isFullscreen, storyEnded]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#C4622D] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product || !product.story_panels?.length) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/30 mb-4">No story available for this product</p>
                    <a href={`/shop/${productId}`} className="text-sm" style={{ color: '#C4622D' }}>← Back to Product</a>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <AnimatePresence>
                {showFullscreenPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="text-center max-w-md px-8"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#C4622D]/10 border border-[#C4622D]/20 flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">🎬</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white/90 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                                Immersive Story Experience
                            </h2>
                            <p className="text-sm text-white/40 mb-8">
                                For the best experience, view this artisan story in fullscreen mode.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={enterFullscreen}
                                    className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:brightness-110"
                                    style={{ background: '#C4622D', boxShadow: '0 4px 20px rgba(196,98,45,0.3)' }}
                                >
                                    Enter Fullscreen
                                </button>
                                <button
                                    onClick={skipFullscreen}
                                    className="w-full py-3 rounded-xl text-sm text-white/30 hover:text-white/50 transition-colors"
                                >
                                    Continue without fullscreen
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {storyEnded && isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#050505]/90 backdrop-blur-md flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-center max-w-sm px-6"
                        >
                            <p className="text-white/60 mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>Story Complete</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={exitFullscreen}
                                    className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:brightness-110"
                                    style={{ background: '#C4622D' }}
                                >
                                    Exit Fullscreen
                                </button>
                                <a
                                    href={`/shop/${productId}`}
                                    className="flex-1 py-3 rounded-xl text-sm border border-white/10 text-white/60 hover:bg-white/5 transition-colors text-center font-medium"
                                >
                                    View Product
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <StoryRenderer panels={product.story_panels} productTitle={product.title} />

            <div className="fixed top-6 right-6 z-40 flex items-center gap-3">
                {isFullscreen && (
                    <button
                        onClick={exitFullscreen}
                        className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white/40 text-xs hover:text-white/70 transition-colors"
                    >
                        Exit FS
                    </button>
                )}
                <a
                    href={`/shop/${productId}`}
                    className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white/40 text-xs hover:text-white/70 transition-colors"
                >
                    ← Product
                </a>
            </div>
        </div>
    );
}
