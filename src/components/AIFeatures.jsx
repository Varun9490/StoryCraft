"use client";

import { motion } from "framer-motion";

const features = [
    {
        id: 1,
        icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M14 8l-2-2-2 2" />
                <path d="M12 6v6" />
            </svg>
        ),
        sparkle: "✨",
        title: "Smart Product FAQs",
        body: "AI generates answers about materials, care, and customization — so artisans spend time crafting, not typing.",
    },
    {
        id: 2,
        icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
            </svg>
        ),
        sparkle: "⚖️",
        title: "Fair Pricing Engine",
        body: "Real-time market analysis ensures artisans are always compensated fairly — and buyers always know why.",
    },
    {
        id: 3,
        icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
            </svg>
        ),
        sparkle: "🎨",
        title: "AI Customization Preview",
        body: "Upload a reference image. We generate a preview of your customized product before a single thread is pulled.",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut" },
    },
};

export default function AIFeatures() {
    return (
        <section
            id="ai-features"
            className="py-24 px-6"
            style={{ background: "#0E0C08" }}
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <span
                        className="text-xs uppercase tracking-[0.3em] text-[#E8A838] mb-4 block"
                        style={{ fontFamily: "var(--font-space)" }}
                    >
                        Powered by AI
                    </span>
                    <h2
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
                        style={{ fontFamily: "var(--font-playfair)" }}
                    >
                        Technology in service of tradition.
                    </h2>
                    <p
                        className="text-base text-white/40 max-w-xl mx-auto"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        We use AI to empower artisans, never to replace them.
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.id}
                            variants={cardVariants}
                            className="glass-card rounded-xl p-8 group hover:border-[#C4622D]/30 transition-all duration-500 relative overflow-hidden"
                        >
                            {/* Gradient hover accent */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#C4622D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="text-[#E8A838]">{feature.icon}</div>
                                    <span className="text-xl">{feature.sparkle}</span>
                                </div>

                                {/* Title */}
                                <h3
                                    className="text-xl font-bold text-white mb-4 group-hover:text-[#E8A838] transition-colors"
                                    style={{ fontFamily: "var(--font-playfair)" }}
                                >
                                    {feature.title}
                                </h3>

                                {/* Body */}
                                <p
                                    className="text-sm leading-relaxed text-white/50"
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    {feature.body}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
