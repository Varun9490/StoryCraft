"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

/* =================== PANEL A =================== */
function PanelA() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-20 section-warm">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left: Text */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2
                        className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8"
                        style={{
                            fontFamily: "var(--font-playfair)",
                            color: "#1A1209",
                        }}
                    >
                        Visakhapatnam has always spoken through its hands.
                    </h2>
                    <p
                        className="text-base md:text-lg leading-relaxed max-w-xl"
                        style={{
                            fontFamily: "var(--font-inter)",
                            color: "#6B5E4E",
                        }}
                    >
                        For over 2,000 years, the coastal city of Visakhapatnam has nurtured
                        a vibrant tapestry of craft traditions. From the Mughal-era origins
                        of Kalamkari — where intricate motifs are hand-painted with
                        natural dyes — to Kondapalli&apos;s 400-year-old legacy of carving
                        wooden toys from softwood, each craft tells a story of resilience
                        and artistry. The Bay of Bengal&apos;s influence echoes in every
                        fishing net motif woven into local textiles, a living tradition
                        passed down through generations.
                    </p>
                </motion.div>

                {/* Right: Image Collage */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative"
                >
                    <div className="watercolor-wash" />
                    <div className="relative z-10 grid grid-cols-2 gap-4">
                        {/* Large Image */}
                        <div className="col-span-2 rounded-xl overflow-hidden aspect-[4/3] relative bg-[#E5DDD4]">
                            <Image
                                src="/images/kalamkari_saree.jpg"
                                alt="Kalamkari saree — hand-painted textile art"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        {/* Small Images */}
                        <div className="rounded-xl overflow-hidden aspect-square relative bg-[#E5DDD4]">
                            <Image
                                src="/images/kondapalli_toy.jpg"
                                alt="Kondapalli wooden toy — traditional carved figurine"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        </div>
                        <div className="rounded-xl overflow-hidden aspect-square relative bg-[#E5DDD4]">
                            <Image
                                src="/images/brass_figurine.jpg"
                                alt="Brass Dhokra figurine — lost-wax casting art"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

/* =================== PANEL B =================== */
function CountUpNumber({ target, suffix = "", duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target, duration]);

    return (
        <span ref={ref} className="tabular-nums">
            {count}
            {suffix}
        </span>
    );
}

function PanelB() {
    const stats = [
        { value: 120, suffix: "+", label: "Artisans" },
        { value: 23, suffix: "", label: "Craft Categories" },
        { value: 100, suffix: "%", label: "Direct Trade" },
    ];

    return (
        <div className="min-h-screen relative flex items-center justify-center px-6 py-20 overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/images/artisan-workshop.jpg')",
                    filter: "grayscale(100%) brightness(0.3)",
                    backgroundColor: "#1A1209",
                }}
            />
            <div className="absolute inset-0 bg-[#050505]/70" />

            <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                    style={{ fontFamily: "var(--font-playfair)" }}
                >
                    Meet the makers.
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-16 leading-relaxed"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    Not factories. Not warehouses. Real people with real stories — in
                    their homes, in their workshops, in their tradition.
                </motion.p>

                {/* Counter Row */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-12 md:gap-20"
                >
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div
                                className="text-4xl md:text-5xl font-bold text-[#E8A838] mb-2"
                                style={{ fontFamily: "var(--font-playfair)" }}
                            >
                                <CountUpNumber target={stat.value} suffix={stat.suffix} />
                            </div>
                            <div
                                className="text-sm uppercase tracking-[0.2em] text-white/40"
                                style={{ fontFamily: "var(--font-space)" }}
                            >
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

/* =================== PANEL C =================== */
function DonutChart() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const segments = [
        { label: "Artisan", percent: 80, color: "#C4622D" },
        { label: "Platform", percent: 12, color: "#E8A838" },
        { label: "Logistics", percent: 8, color: "#6B5E4E" },
    ];

    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div ref={ref} className="flex flex-col items-center gap-6">
            <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-lg">
                <circle cx="110" cy="110" r={radius} fill="none" stroke="#E5DDD4" strokeWidth="24" />
                {segments.map((seg, i) => {
                    const dashLength = (seg.percent / 100) * circumference;
                    const dashOffset = -offset;
                    offset += dashLength;
                    return (
                        <motion.circle
                            key={i}
                            cx="110"
                            cy="110"
                            r={radius}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="24"
                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                            strokeDashoffset={isInView ? dashOffset : circumference}
                            strokeLinecap="butt"
                            transform="rotate(-90 110 110)"
                            initial={{ strokeDashoffset: circumference }}
                            animate={isInView ? { strokeDashoffset: dashOffset } : {}}
                            transition={{ duration: 1.2, delay: i * 0.3, ease: "easeOut" }}
                        />
                    );
                })}
                <text
                    x="110"
                    y="105"
                    textAnchor="middle"
                    fill="#1A1209"
                    fontSize="28"
                    fontWeight="bold"
                    style={{ fontFamily: "var(--font-playfair)" }}
                >
                    80%
                </text>
                <text
                    x="110"
                    y="125"
                    textAnchor="middle"
                    fill="#6B5E4E"
                    fontSize="11"
                    style={{ fontFamily: "var(--font-inter)" }}
                >
                    goes to artisan
                </text>
            </svg>

            <div className="flex gap-6">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: seg.color }}
                        />
                        <span className="text-[#6B5E4E]">
                            {seg.label} {seg.percent}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PanelC() {
    const beforeItems = [
        "Middlemen taking 60–70% of the price",
        "No story, no recognition",
        "No price transparency",
    ];
    const afterItems = [
        "Artisan earns 80%+ directly",
        "Every product has a living story",
        "Traceable from hand to home",
    ];

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-20 section-warm">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left: Contrast Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, staggerChildren: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                    {/* Before Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="rounded-xl p-6 text-white border border-red-900/30"
                        style={{ background: "#1A1209" }}
                    >
                        <div className="text-3xl mb-4">⛓️‍💥</div>
                        <h3
                            className="text-xl font-bold mb-4"
                            style={{ fontFamily: "var(--font-playfair)" }}
                        >
                            Before StoryCraft
                        </h3>
                        <ul className="space-y-3" style={{ fontFamily: "var(--font-inter)" }}>
                            {beforeItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                                    <span className="text-red-400/70 mt-0.5">✕</span>
                                    <span className="line-through decoration-white/20">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* After Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="rounded-xl p-6 text-white border border-[#C4622D]/20"
                        style={{
                            background: "linear-gradient(135deg, #C4622D, #a84f22)",
                        }}
                    >
                        <div className="text-3xl mb-4">🤝</div>
                        <h3
                            className="text-xl font-bold mb-4"
                            style={{ fontFamily: "var(--font-playfair)" }}
                        >
                            With StoryCraft
                        </h3>
                        <ul className="space-y-3" style={{ fontFamily: "var(--font-inter)" }}>
                            {afterItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                                    <span className="text-[#E8A838] mt-0.5">✓</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </motion.div>

                {/* Right: Donut Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex justify-center"
                >
                    <DonutChart />
                </motion.div>
            </div>
        </div>
    );
}

/* =================== MAIN EXPORT =================== */
export default function StoryPanels() {
    return (
        <section id="story" className="relative">
            <PanelA />
            <PanelB />
            <PanelC />
        </section>
    );
}
