"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_FRAMES = 214;
const FRAME_PATH = "/images/globe-sequence/ezgif-frame-";

// Generate stars deterministically using a seed to avoid hydration issues
function generateStars(count) {
    const stars = [];
    // Use a simple seeded pseudo-random for deterministic output
    let seed = 12345;
    function seededRandom() {
        seed = (seed * 16807 + 0) % 2147483647;
        return (seed - 1) / 2147483646;
    }
    for (let i = 0; i < count; i++) {
        stars.push({
            id: i,
            left: `${seededRandom() * 100}%`,
            top: `${seededRandom() * 100}%`,
            size: seededRandom() * 2.5 + 0.5,
            delay: seededRandom() * 5,
            duration: seededRandom() * 3 + 2,
            opacity: seededRandom() * 0.6 + 0.2,
        });
    }
    return stars;
}

const STARS = generateStars(120);

export default function GlobeSection() {
    const sectionRef = useRef(null);
    const canvasRef = useRef(null);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [textVisible, setTextVisible] = useState(false);
    const [ctaVisible, setCtaVisible] = useState(false);
    const [scrollIndicator, setScrollIndicator] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const imagesRef = useRef([]);
    const animFrameRef = useRef(null);
    const phaseRef = useRef(0); // ref to avoid re-triggering animation effect

    // Preload all frame images
    useEffect(() => {
        let loaded = 0;
        const images = [];

        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.src = `${FRAME_PATH}${String(i).padStart(3, "0")}.jpg`;
            img.onload = () => {
                loaded++;
                // Consider ready after first 30 frames loaded (enough to start)
                if (loaded >= 30 && !imagesLoaded) {
                    setImagesLoaded(true);
                }
            };
            img.onerror = () => {
                loaded++;
                if (loaded >= 30 && !imagesLoaded) {
                    setImagesLoaded(true);
                }
            };
            images.push(img);
        }
        imagesRef.current = images;

        // Safety fallback — start anyway after 3 seconds
        const fallback = setTimeout(() => {
            if (!imagesLoaded) setImagesLoaded(true);
        }, 3000);

        return () => clearTimeout(fallback);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-play phase timeline (only starts after images are ready)
    useEffect(() => {
        if (!imagesLoaded) return;

        const timeline = [
            { phase: 1, delay: 200 },
            { phase: 2, delay: 2000 },
            { phase: 3, delay: 4000 },
            { phase: 4, delay: 6000 },
            { phase: 5, delay: 8000 },
        ];

        const timers = timeline.map(({ phase, delay }) =>
            setTimeout(() => {
                phaseRef.current = phase;
                setCurrentPhase(phase);
            }, delay)
        );

        const t1 = setTimeout(() => setTextVisible(true), 8500);
        const t2 = setTimeout(() => setCtaVisible(true), 10000);
        const t3 = setTimeout(() => setScrollIndicator(true), 11000);

        return () => {
            timers.forEach(clearTimeout);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [imagesLoaded]);

    // Draw a specific frame on canvas
    const drawFrame = useCallback((frameIndex) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const img = imagesRef.current[frameIndex];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        // Set canvas size to match its display size (only if changed)
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }

        // Calculate "cover" dimensions
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = canvas.width / canvas.height;

        let drawWidth, drawHeight, offsetX, offsetY;
        if (canvasRatio > imgRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Atmospheric glow
        const phase = phaseRef.current;
        if (phase >= 1 && phase <= 3) {
            const gradient = ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                canvas.width * 0.1,
                canvas.width / 2,
                canvas.height / 2,
                canvas.width * 0.5
            );
            gradient.addColorStop(0, "rgba(100, 180, 255, 0)");
            gradient.addColorStop(0.6, "rgba(60, 140, 220, 0.04)");
            gradient.addColorStop(1, "rgba(30, 80, 180, 0.1)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    // Frame sequence animation (runs once, independent of phase changes)
    useEffect(() => {
        if (!imagesLoaded) return;

        let startTime = null;
        const duration = 8000;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Eased progress for smoother feel
            const eased = 1 - Math.pow(1 - progress, 2);

            const frameIndex = Math.min(
                Math.floor(eased * (TOTAL_FRAMES - 1)),
                TOTAL_FRAMES - 1
            );

            drawFrame(frameIndex);

            if (progress < 1) {
                animFrameRef.current = requestAnimationFrame(animate);
            }
        };

        // Small delay to let canvas mount properly
        const startDelay = setTimeout(() => {
            animFrameRef.current = requestAnimationFrame(animate);
        }, 100);

        return () => {
            clearTimeout(startDelay);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [imagesLoaded, drawFrame]);

    const headingText = "Where hands tell stories.";
    const headingChars = headingText.split("");

    return (
        <section
            ref={sectionRef}
            id="hero"
            className="relative w-full h-screen overflow-hidden"
            style={{ background: "#050505" }}
        >
            {/* Starfield */}
            <div className="starfield">
                {STARS.map((star) => (
                    <motion.div
                        key={star.id}
                        className="star"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: currentPhase >= 1 ? star.opacity : 0,
                        }}
                        transition={{ duration: 2, delay: star.delay * 0.2 }}
                        style={{
                            left: star.left,
                            top: star.top,
                            width: star.size,
                            height: star.size,
                        }}
                    />
                ))}
            </div>

            {/* Globe Frame Sequence Canvas */}
            <motion.div
                className="absolute inset-0 z-[2]"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: currentPhase >= 1 ? (currentPhase >= 5 ? 0 : 1) : 0,
                }}
                transition={{ duration: currentPhase >= 5 ? 1.5 : 2 }}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block"
                    style={{ width: "100%", height: "100%" }}
                />
            </motion.div>

            {/* Vizag Pin Marker */}
            <AnimatePresence>
                {currentPhase >= 4 && currentPhase < 5 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="absolute z-[3] flex flex-col items-center"
                        style={{
                            left: "55%",
                            top: "45%",
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <div className="w-4 h-4 rounded-full bg-[#C4622D] pulse-pin" />
                        <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-2 text-xs text-white/80 tracking-widest uppercase"
                            style={{ fontFamily: "var(--font-space)" }}
                        >
                            Visakhapatnam
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Text Reveal Overlay */}
            <motion.div
                className="absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: currentPhase >= 5 ? 1 : 0 }}
                transition={{ duration: 1.5 }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/60 to-[#050505]/90" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    {/* Main Heading */}
                    <h1
                        className="hero-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
                        style={{ fontFamily: "var(--font-playfair)" }}
                    >
                        {textVisible &&
                            headingChars.map((char, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: i * 0.04,
                                        ease: [0.25, 0.46, 0.45, 0.94],
                                    }}
                                    className="inline-block"
                                    style={{
                                        marginRight: char === " " ? "0.3em" : "0",
                                    }}
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                    </h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: ctaVisible ? 1 : 0,
                            y: ctaVisible ? 0 : 20,
                        }}
                        transition={{ duration: 0.8 }}
                        className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        Discover handcrafted art from the craftspeople of
                        Visakhapatnam — each piece carrying a legacy.
                    </motion.p>

                    {/* CTA Button */}
                    <motion.a
                        href="#shop"
                        id="cta-explore"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: ctaVisible ? 1 : 0,
                            y: ctaVisible ? 0 : 20,
                        }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="inline-block px-8 py-4 bg-[#C4622D] text-white font-semibold text-base rounded-lg hover:bg-[#a84f22] transition-colors duration-300 shadow-lg shadow-[#C4622D]/30"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        Explore StoryCraft
                    </motion.a>
                </div>
            </motion.div>

            {/* Scroll Indicator */}
            <AnimatePresence>
                {scrollIndicator && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[6] flex flex-col items-center gap-2 scroll-indicator"
                    >
                        <span
                            className="text-white/40 text-xs uppercase tracking-[0.3em]"
                            style={{ fontFamily: "var(--font-space)" }}
                        >
                            Scroll
                        </span>
                        <svg
                            width="20"
                            height="30"
                            viewBox="0 0 20 30"
                            fill="none"
                            className="text-white/40"
                        >
                            <rect
                                x="1"
                                y="1"
                                width="18"
                                height="28"
                                rx="9"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <motion.circle
                                cx="10"
                                cy="10"
                                r="3"
                                fill="currentColor"
                                animate={{ y: [0, 10, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                }}
                            />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading indicator while frames load */}
            <AnimatePresence>
                {!imagesLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 z-[10] flex items-center justify-center"
                        style={{ background: "#050505" }}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-2 border-[#C4622D] border-t-transparent rounded-full animate-spin" />
                            <span
                                className="text-white/30 text-xs uppercase tracking-[0.2em]"
                                style={{ fontFamily: "var(--font-space)" }}
                            >
                                Loading experience...
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
