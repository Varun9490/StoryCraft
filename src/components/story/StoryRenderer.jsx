'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

function StoryPanel({ panel, index }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.92, 1, 1, 0.95]);
    const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.05]);

    if (panel.layout === 'full-image') {
        return (
            <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {panel.image_url && (
                    <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
                        <img src={panel.image_url} alt={panel.heading} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                    </motion.div>
                )}
                <motion.div style={{ y, opacity }} className="relative z-10 max-w-3xl text-center px-6">
                    {panel.heading && (
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
                            {panel.heading}
                        </h2>
                    )}
                    {panel.body && (
                        <p className="text-lg md:text-xl text-white/70 leading-relaxed">{panel.body}</p>
                    )}
                </motion.div>
            </section>
        );
    }

    if (panel.layout === 'centered') {
        return (
            <section ref={ref} className="min-h-screen flex items-center justify-center px-6">
                <motion.div style={{ opacity, scale }} className="max-w-3xl text-center space-y-8">
                    {panel.heading && (
                        <h2 className="text-3xl md:text-5xl font-bold text-white/90" style={{ fontFamily: 'var(--font-playfair)' }}>
                            {panel.heading}
                        </h2>
                    )}
                    {panel.image_url && (
                        <motion.div className="rounded-2xl overflow-hidden border border-white/10" style={{ scale: imgScale }}>
                            <img src={panel.image_url} alt={panel.heading} className="w-full h-auto" />
                        </motion.div>
                    )}
                    {panel.body && (
                        <p className="text-lg text-white/60 leading-relaxed max-w-xl mx-auto">{panel.body}</p>
                    )}
                </motion.div>
            </section>
        );
    }

    const isRight = panel.layout === 'text-right';

    return (
        <section ref={ref} className="min-h-screen flex items-center px-6 md:px-16">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-7xl mx-auto w-full ${isRight ? '' : ''}`}>
                <motion.div
                    style={{ y, opacity }}
                    className={`flex flex-col justify-center space-y-6 ${isRight ? 'md:order-2' : ''}`}
                >
                    {panel.heading && (
                        <h2 className="text-3xl md:text-4xl font-bold text-white/90" style={{ fontFamily: 'var(--font-playfair)' }}>
                            {panel.heading}
                        </h2>
                    )}
                    {panel.body && (
                        <p className="text-base md:text-lg text-white/55 leading-relaxed">{panel.body}</p>
                    )}
                    <div className="w-16 h-[2px] rounded-full" style={{ background: '#C4622D' }} />
                </motion.div>
                {panel.image_url && (
                    <motion.div
                        style={{ scale }}
                        className={`rounded-2xl overflow-hidden border border-white/10 ${isRight ? 'md:order-1' : ''}`}
                    >
                        <motion.img
                            src={panel.image_url}
                            alt={panel.heading}
                            className="w-full h-full object-cover min-h-[400px]"
                            style={{ scale: imgScale }}
                        />
                    </motion.div>
                )}
            </div>
        </section>
    );
}

export default function StoryRenderer({ panels = [], productTitle = '' }) {
    return (
        <div className="relative bg-[#050505]">
            <section className="min-h-screen flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A0503] via-[#050505] to-[#050505]" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="relative z-10 text-center px-6"
                >
                    <p className="text-xs uppercase tracking-[0.3em] text-[#C4622D] mb-4 font-medium">The Story Behind</p>
                    <h1 className="text-4xl md:text-7xl font-bold text-white/95 mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {productTitle}
                    </h1>
                    <div className="animate-bounce mt-12">
                        <span className="text-white/20 text-2xl">↓</span>
                    </div>
                </motion.div>
            </section>

            {panels
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((panel, i) => (
                    <StoryPanel key={i} panel={panel} index={i} />
                ))}

            <section className="min-h-[50vh] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center px-6"
                >
                    <p className="text-white/20 text-sm uppercase tracking-widest mb-4">End of Story</p>
                    <div className="w-12 h-[1px] bg-[#C4622D] mx-auto" />
                </motion.div>
            </section>
        </div>
    );
}
