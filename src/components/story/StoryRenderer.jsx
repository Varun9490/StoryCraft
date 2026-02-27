'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

/* ── great-apes–style clip-path reveal ── */
const clipReveal = {
    hidden: { clipPath: 'inset(100% 0 0 0)' },
    visible: {
        clipPath: 'inset(0% 0 0 0)',
        transition: { duration: 1.4, ease: [0.77, 0, 0.18, 1] },
    },
};

/* ── text slide up / fade ── */
const textUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 1.0, delay, ease: [0.22, 1, 0.36, 1] },
    },
});

/* ── horizontal line grow ── */
const lineGrow = {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
        scaleX: 1,
        transition: { duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
};

/* ── counter label ── */
function PanelCounter({ index, total }) {
    return (
        <div className="absolute top-8 left-8 z-20 flex items-center gap-3 mix-blend-difference">
            <span className="text-[11px] tracking-[0.25em] text-white/40 uppercase font-mono">
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
        </div>
    );
}

function StoryPanel({ panel, index, total }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: '-10%' });
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const imgY = useTransform(scrollYProgress, [0, 1], ['15%', '-15%']);
    const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.25, 1.05, 1]);

    /* ─── full-image: immersive background ─── */
    if (panel.layout === 'full-image') {
        return (
            <section
                ref={ref}
                className="relative h-[120vh] flex items-center justify-center overflow-hidden"
            >
                <PanelCounter index={index} total={total} />
                {panel.image_url && (
                    <motion.div className="absolute inset-0 will-change-transform" style={{ y: imgY, scale: imgScale }}>
                        <motion.img
                            src={panel.image_url}
                            alt={panel.heading}
                            className="w-full h-full object-cover"
                            variants={clipReveal}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, margin: "-10%" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-[#050505]/20" />
                    </motion.div>
                )}
                <div className="relative z-10 max-w-4xl text-center px-8">
                    {panel.heading && (
                        <motion.h2
                            variants={textUp(0.2)}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, margin: "-10%" }}
                            className="text-5xl md:text-8xl font-bold text-white leading-[0.95] mb-8"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            {panel.heading}
                        </motion.h2>
                    )}
                    {panel.body && (
                        <motion.p
                            variants={textUp(0.45)}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, margin: "-10%" }}
                            className="text-base md:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto"
                        >
                            {panel.body}
                        </motion.p>
                    )}
                </div>
            </section>
        );
    }

    /* ─── centered: text-heavy ─── */
    if (panel.layout === 'centered') {
        return (
            <section ref={ref} className="relative min-h-screen flex items-center justify-center px-8 py-24 overflow-hidden">
                <PanelCounter index={index} total={total} />
                <div className="max-w-4xl text-center space-y-10">
                    {panel.heading && (
                        <motion.h2
                            variants={textUp(0)}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, margin: "-10%" }}
                            className="text-4xl md:text-7xl font-bold text-white/90 leading-[1.0]"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            {panel.heading}
                        </motion.h2>
                    )}
                    {panel.image_url && (
                        <motion.div
                            variants={clipReveal}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, margin: "-10%" }}
                            className="rounded-2xl overflow-hidden border border-white/5 mx-auto max-w-3xl"
                        >
                            <motion.img
                                src={panel.image_url}
                                alt={panel.heading}
                                className="w-full h-auto"
                                style={{ scale: imgScale }}
                            />
                        </motion.div>
                    )}
                    {panel.body && (
                        <motion.p
                            variants={textUp(0.3)}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, margin: "-10%" }}
                            className="text-base md:text-lg text-white/50 leading-relaxed max-w-xl mx-auto"
                        >
                            {panel.body}
                        </motion.p>
                    )}
                    <motion.div variants={lineGrow} initial="hidden" whileInView="visible" viewport={{ once: false, margin: "-10%" }} className="w-24 h-[1px] bg-[#C4622D] mx-auto" />
                </div>
            </section>
        );
    }

    /* ─── text-left / text-right: split layout ─── */
    const isRight = panel.layout === 'text-right';

    return (
        <section ref={ref} className="relative min-h-screen flex flex-col md:flex-row overflow-hidden bg-[#0A0503]">
            <PanelCounter index={index} total={total} />

            {/* text column */}
            <div className={`w-full md:w-1/2 flex items-center justify-center p-12 md:p-24 ${isRight ? 'md:order-2' : 'md:order-1'}`}>
                <div className="max-w-xl w-full flex flex-col justify-center space-y-8">
                    {panel.heading && (
                        <motion.h2
                            variants={textUp(0)}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, margin: "-10%" }}
                            className="text-4xl md:text-5xl font-bold text-white/90 leading-[1.15]"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            {panel.heading}
                        </motion.h2>
                    )}
                    {panel.body && (
                        <motion.p
                            variants={textUp(0.2)}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, margin: "-10%" }}
                            className="text-lg md:text-xl text-white/50 leading-relaxed"
                        >
                            {panel.body}
                        </motion.p>
                    )}
                    <motion.div
                        variants={lineGrow}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, margin: "-10%" }}
                        className="w-20 h-[2px] bg-[#C4622D]"
                    />
                </div>
            </div>

            {/* image column */}
            <div className={`w-full md:w-1/2 h-[50vh] md:h-screen relative ${isRight ? 'md:order-1' : 'md:order-2'}`}>
                {panel.image_url && (
                    <motion.div
                        variants={clipReveal}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, margin: "-10%" }}
                        className="absolute inset-0 overflow-hidden"
                    >
                        <motion.img
                            src={panel.image_url}
                            alt={panel.heading}
                            className="w-full h-full object-cover"
                            style={{ y: imgY, scale: imgScale }}
                        />
                    </motion.div>
                )}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════
   Main Renderer
   ══════════════════════════════════════════ */
export default function StoryRenderer({ panels = [], productTitle = '' }) {
    const sortedPanels = [...panels].sort((a, b) => (a.order || 0) - (b.order || 0));
    const heroRef = useRef(null);
    const heroInView = useInView(heroRef, { once: true });
    const { scrollYProgress: heroScroll } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
    const heroScale = useTransform(heroScroll, [0, 0.6], [1, 0.92]);
    const heroY = useTransform(heroScroll, [0, 0.6], [0, -80]);

    return (
        <div className="relative bg-[#050505]">
            {/* ── hero title section (great-apes style) ── */}
            <section ref={heroRef} className="h-[100vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A0503] via-[#050505] to-[#050505]" />
                    {/* decorative radial ring */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full border border-white/[0.03]"
                        style={{ filter: 'blur(1px)' }}
                    />
                </div>
                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                    className="relative z-10 text-center px-8"
                >
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[11px] uppercase tracking-[0.4em] mb-6 font-medium"
                        style={{ color: '#C4622D' }}
                    >
                        The Story Behind
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 50, clipPath: 'inset(100% 0 0 0)' }}
                        animate={heroInView ? { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' } : {}}
                        transition={{ duration: 1.4, delay: 0.2, ease: [0.77, 0, 0.18, 1] }}
                        className="text-5xl md:text-9xl font-bold text-white/95 leading-[0.9]"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        {productTitle}
                    </motion.h1>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={heroInView ? { scaleX: 1 } : {}}
                        transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="w-16 h-[1px] bg-[#C4622D] mx-auto mt-10 origin-center"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={heroInView ? { opacity: 1 } : {}}
                        transition={{ delay: 1.5, duration: 0.8 }}
                        className="mt-16"
                    >
                        <span className="text-white/15 text-xs tracking-widest uppercase">scroll to explore</span>
                        <div className="mt-4 w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent mx-auto animate-pulse" />
                    </motion.div>
                </motion.div>
            </section>

            {/* ── story panels ── */}
            {sortedPanels.map((panel, i) => (
                <StoryPanel key={i} panel={panel} index={i} total={sortedPanels.length} />
            ))}

            {/* ── ending ── */}
            <section className="h-[60vh] flex items-center justify-center relative">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: '-20%' }}
                    transition={{ duration: 1.2 }}
                    className="text-center px-8"
                >
                    <div className="w-8 h-[1px] bg-[#C4622D] mx-auto mb-6" />
                    <p className="text-white/15 text-[11px] uppercase tracking-[0.3em]">End of Story</p>
                </motion.div>
            </section>
        </div>
    );
}
