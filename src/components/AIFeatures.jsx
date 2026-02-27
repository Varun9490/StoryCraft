"use client";

import { motion } from "framer-motion";

const features = [
    {
        id: 1,
        icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
        ),
        sparkle: "🎬",
        title: "Cinematic Product Storytelling",
        body: "Immersive storytelling interface highlighting artisan identity, heritage, and product journey.",
    },
    {
        id: 2,
        icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
        ),
        sparkle: "⚖️",
        title: "AI-Based Pricing Insights",
        body: "AI-driven pricing recommendations based on product details and market trends.",
    },
    {
        id: 3,
        icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M14 8l-2-2-2 2" />
                <path d="M12 6v6" />
            </svg>
        ),
        sparkle: "💡",
        title: "AI-Generated FAQs",
        body: "Automatic FAQ generation from product descriptions to assist buyers instantly.",
    },
    {
        id: 4,
        icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <circle cx="11" cy="11" r="3"></circle>
            </svg>
        ),
        sparkle: "📸",
        title: "AI-Powered Visual Search",
        body: "Image-based search to help users discover visually similar handcrafted products.",
    },
    {
        id: 5,
        icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <path d="M8 9h8"></path>
                <path d="M8 13h6"></path>
            </svg>
        ),
        sparkle: "🤖",
        title: "Intelligent AI Chatbot",
        body: "Real-time assistance for product queries and platform guidance.",
    },
    {
        id: 6,
        icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2A10 10 0 0 0 2 12c0 2.38.83 4.56 2.21 6.27L3 22l3.73-1.21A9.95 9.95 0 0 0 12 22a10 10 0 0 0 0-20z"></path>
                <path d="M16 12H8"></path>
                <path d="M12 8v8"></path>
            </svg>
        ),
        sparkle: "🛠️",
        title: "Customization Through Chat",
        body: "Direct buyer–artisan communication for personalized product customization.",
    },
    {
        id: 7,
        icon: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
                <polyline points="2 6 6 2 12 8 18 2 22 6"></polyline>
            </svg>
        ),
        sparkle: "📈",
        title: "AI Selling Suggestions",
        body: "Smart recommendations to optimize product listings and improve sales performance.",
    }
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
                        Features
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
