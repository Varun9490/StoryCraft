"use client";

import { motion } from "framer-motion";

const footerLinks = [
    "About",
    "Artisans",
    "Craft Categories",
    "Traceability",
    "AI Features",
    "Blog",
    "Contact",
];

const socialLinks = [
    {
        name: "Instagram",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
        ),
    },
    {
        name: "YouTube",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
            </svg>
        ),
    },
    {
        name: "Twitter/X",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
            </svg>
        ),
    },
];

export default function CTAFooter() {
    return (
        <section id="cta-footer" style={{ background: "#050505" }}>
            {/* CTA Panel */}
            <div className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
                {/* Background Video Placeholder */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/images/artisan-hands.jpg')",
                    }}
                />
                <div className="absolute inset-0 bg-[#050505]/70" />

                {/* Subtle moving gradient */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
                        animate={{
                            x: [0, 50, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        style={{
                            background:
                                "radial-gradient(ellipse at 30% 50%, rgba(196,98,45,0.05) 0%, transparent 50%)",
                        }}
                    />
                </div>

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                        style={{ fontFamily: "var(--font-playfair)" }}
                    >
                        Own a piece of Visakhapatnam.
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg text-white/50 mb-12 max-w-xl mx-auto leading-relaxed"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        Each product you buy supports a family, preserves a tradition, and
                        carries a story older than you know.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <a
                            href="/register?role=buyer"
                            id="cta-start-exploring"
                            className="inline-flex items-center justify-center px-8 py-4 bg-[#C4622D] text-white font-semibold rounded-lg hover:bg-[#a84f22] transition-all duration-300 shadow-lg shadow-[#C4622D]/30 text-base"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            Start Exploring →
                        </a>
                        <a
                            href="/register?role=artisan"
                            id="cta-register-artisan"
                            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:border-white/60 hover:bg-white/5 transition-all duration-300 text-base"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            Register as Artisan
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 px-6 py-16">
                <div className="max-w-7xl mx-auto">
                    {/* Top Row: Logo + Links + Social */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        {/* Logo & Tagline */}
                        <div>
                            <span
                                className="text-3xl font-bold italic text-[#C4622D] block mb-4"
                                style={{ fontFamily: "var(--font-playfair)" }}
                            >
                                StoryCraft
                            </span>
                            <p
                                className="text-sm text-white/40 leading-relaxed"
                                style={{ fontFamily: "var(--font-inter)" }}
                            >
                                Handcrafted in Visakhapatnam.
                                <br />
                                Delivered with a story.
                            </p>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap gap-x-8 gap-y-3">
                            {footerLinks.map((link) => (
                                <a
                                    key={link}
                                    href="#"
                                    className="text-sm text-white/40 hover:text-[#C4622D] transition-colors"
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    {link}
                                </a>
                            ))}
                        </div>

                        {/* Social */}
                        <div className="flex gap-4 md:justify-end">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href="#"
                                    aria-label={social.name}
                                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#C4622D] hover:border-[#C4622D]/30 transition-all duration-300"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p
                            className="text-xs text-white/30"
                            style={{ fontFamily: "var(--font-space)" }}
                        >
                            © 2026 StoryCraft. All rights reserved.
                        </p>
                        <p
                            className="text-xs text-white/20 italic"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            Made with ❤️ for the artisans of Andhra Pradesh
                        </p>
                    </div>
                </div>
            </footer>
        </section>
    );
}
