"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
    {
        id: 1,
        emoji: "🔍",
        title: "DISCOVER",
        heading: "Browse with stories",
        description:
            "Explore handcrafted products organized by craft, region, and artisan. See who made each piece and learn the story behind it — before you buy.",
    },
    {
        id: 2,
        emoji: "🤝",
        title: "CONNECT",
        heading: "Meet the artisan",
        description:
            "Every product shows the artisan's face, workshop, and craft tradition. Watch short videos of the creation process and ask questions directly.",
    },
    {
        id: 3,
        emoji: "📦",
        title: "RECEIVE & TRACE",
        heading: "Scan the story",
        description:
            "Your product arrives with a QR code. Scan it to trace the journey — from raw materials to your doorstep. Share the story with friends.",
    },
];

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(1);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev >= 3 ? 1 : prev + 1));
        }, 4000);
        return () => clearInterval(timer);
    }, [isInView]);

    return (
        <section id="how-it-works" className="section-warm py-24 px-6" ref={ref}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <span
                        className="text-xs uppercase tracking-[0.3em] text-[#C4622D] mb-4 block"
                        style={{ fontFamily: "var(--font-space)" }}
                    >
                        Process
                    </span>
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-4"
                        style={{
                            fontFamily: "var(--font-playfair)",
                            color: "#1A1209",
                        }}
                    >
                        How It Works
                    </h2>
                </motion.div>

                {/* Step Navigation */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center">
                            <button
                                onClick={() => setActiveStep(step.id)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 ${step.id <= activeStep
                                    ? "bg-[#C4622D] text-white shadow-lg shadow-[#C4622D]/30"
                                    : "bg-white text-[#6B5E4E] border-2 border-[#E5DDD4]"
                                    }`}
                                style={{ fontFamily: "var(--font-playfair)" }}
                            >
                                {step.emoji}
                            </button>
                            {i < steps.length - 1 && (
                                <div className="w-16 md:w-24 h-1 mx-2 rounded-full overflow-hidden bg-[#E5DDD4]">
                                    <motion.div
                                        className="h-full bg-[#C4622D]"
                                        initial={{ width: "0%" }}
                                        animate={{
                                            width: step.id < activeStep ? "100%" : "0%",
                                        }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: step.id * 0.15 }}
                            onClick={() => setActiveStep(step.id)}
                            className={`p-8 rounded-xl border cursor-none transition-all duration-500 ${step.id === activeStep
                                ? "bg-white border-[#C4622D]/30 shadow-xl shadow-[#C4622D]/5 scale-[1.02]"
                                : "bg-white/50 border-[#E5DDD4] hover:border-[#C4622D]/20"
                                }`}
                        >
                            <div
                                className="text-xs uppercase tracking-[0.2em] text-[#C4622D] mb-2"
                                style={{ fontFamily: "var(--font-space)" }}
                            >
                                {step.title}
                            </div>
                            <h3
                                className="text-xl font-bold mb-3 text-[#1A1209]"
                                style={{ fontFamily: "var(--font-playfair)" }}
                            >
                                {step.heading}
                            </h3>
                            <p
                                className="text-sm leading-relaxed text-[#6B5E4E]"
                                style={{ fontFamily: "var(--font-inter)" }}
                            >
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
