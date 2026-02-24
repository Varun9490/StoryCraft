"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

const testimonials = [
    {
        id: 1,
        quote:
            "I received a beautiful Kalamkari piece and the QR code told me the entire story — from the artisan who painted it to the natural dyes used. I've never felt so connected to something I bought online.",
        author: "Priya Sharma",
        role: "Buyer, Mumbai",
        avatar: "PS",
    },
    {
        id: 2,
        quote:
            "Before StoryCraft, middlemen took most of my earnings. Now I earn 4x more for the same work. My children can go to school because of this platform.",
        author: "Lakshmi Devi",
        role: "Artisan, Anakapalle",
        avatar: "LD",
    },
    {
        id: 3,
        quote:
            "The AI FAQ feature saved me hours every week. Customers get instant answers about materials and care instructions, and I can focus on my craft.",
        author: "Ananta Rao",
        role: "Artisan, Vizag",
        avatar: "AR",
    },
];

const badges = [
    { icon: "🔒", label: "Secure Payments" },
    { icon: "📦", label: "Verified Artisans" },
    { icon: "🌿", label: "Eco Packaging" },
    { icon: "🤝", label: "Direct Trade" },
    { icon: "🏺", label: "Traceability QR" },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="section-warm py-24 px-6">
            <div className="max-w-7xl mx-auto">
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
                        Voices
                    </span>
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-4"
                        style={{
                            fontFamily: "var(--font-playfair)",
                            color: "#1A1209",
                        }}
                    >
                        Stories from Our Community
                    </h2>
                </motion.div>

                {/* Testimonial Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.15 }}
                        >
                            <div className="bg-white rounded-xl p-8 border border-[#E5DDD4] h-full hover:border-[#C4622D]/30 hover:shadow-xl hover:shadow-[#C4622D]/5 transition-all duration-300 flex flex-col">
                                {/* Quote Icon */}
                                <div className="text-4xl text-[#C4622D]/30 mb-4"
                                    style={{ fontFamily: "var(--font-playfair)" }}
                                >
                                    &ldquo;
                                </div>

                                {/* Quote Text */}
                                <p
                                    className="text-base leading-relaxed text-[#6B5E4E] mb-8 flex-grow"
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    {testimonial.quote}
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-4 border-t border-[#E5DDD4]">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C4622D] to-[#E8A838] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div
                                            className="text-sm font-semibold text-[#1A1209]"
                                            style={{ fontFamily: "var(--font-inter)" }}
                                        >
                                            {testimonial.author}
                                        </div>
                                        <div
                                            className="text-xs text-[#6B5E4E]"
                                            style={{ fontFamily: "var(--font-space)" }}
                                        >
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-6 mt-16 pt-12 border-t border-[#E5DDD4]"
                >
                    {badges.map((badge, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5DDD4] text-sm text-[#6B5E4E]"
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            <span className="text-lg">{badge.icon}</span>
                            <span>{badge.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
