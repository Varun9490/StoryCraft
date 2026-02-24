"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const artisans = [
    {
        id: 1,
        name: "Lakshmi Devi",
        location: "Anakapalle",
        craft: "Kalamkari",
        years: "12 years on StoryCraft",
        quote: "Every stroke is a prayer.",
        fullQuote: "Every stroke is a prayer — I paint what my grandmother taught me, and her grandmother before her.",
        image: "/images/artisan-1.jpg",
        rotation: -3,
    },
    {
        id: 2,
        name: "Ramu Kondapalli",
        location: "Vijayawada",
        craft: "Wooden Toys",
        years: "8 years on StoryCraft",
        quote: "Wood speaks to me.",
        fullQuote: "Wood speaks to me — I just listen and carve what it wants to become.",
        image: "/images/artisan-2.jpg",
        rotation: 2,
    },
    {
        id: 3,
        name: "Ananta Rao",
        location: "Vizag",
        craft: "Brass Dhokra",
        years: "15 years on StoryCraft",
        quote: "Lost wax, found purpose.",
        fullQuote: "Lost wax, found purpose. This ancient technique gives meaning to my every day.",
        image: "/images/artisan-6.jpg",
        rotation: -1.5,
    },
    {
        id: 4,
        name: "Saraswathi Patnaik",
        location: "Araku",
        craft: "Tribal Weave",
        years: "5 years on StoryCraft",
        quote: "Threads carry memories.",
        fullQuote: "Threads carry memories — each pattern tells a story of our tribe, our mountains, our home.",
        image: "/images/artisan-4.jpg",
        rotation: 3,
    },
    {
        id: 5,
        name: "Narasimha",
        location: "Bheemunipatnam",
        craft: "Palm Leaf Art",
        years: "10 years on StoryCraft",
        quote: "Nature gives, I create.",
        fullQuote: "Nature gives, I create. Each palm leaf is a gift from the sea breeze.",
        image: "/images/artisan-5.jpg",
        rotation: -2,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const posterVariants = {
    hidden: { opacity: 0, y: 60, rotate: 0 },
    visible: (rotation) => ({
        opacity: 1,
        y: 0,
        rotate: rotation,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

export default function ArtisanPosters() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            id="artisans"
            className="py-24 px-6"
            style={{ background: "#1A1209" }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
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
                        The Makers
                    </span>
                    <h2
                        className="text-4xl md:text-5xl font-bold text-white mb-4"
                        style={{ fontFamily: "var(--font-playfair)" }}
                    >
                        Featured Artisans
                    </h2>
                    <p
                        className="text-base text-white/50 max-w-xl mx-auto"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        Meet the extraordinary craftspeople behind every piece in our collection.
                    </p>
                </motion.div>

                {/* Flying Posters Grid */}
                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-16"
                >
                    {artisans.map((artisan) => (
                        <motion.div
                            key={artisan.id}
                            custom={artisan.rotation}
                            variants={posterVariants}
                            className="poster-card relative bg-[#2a2015] rounded-xl overflow-hidden border border-[#3a3025] group cursor-pointer"
                            style={{ transform: `rotate(${artisan.rotation}deg)` }}
                        >
                            {/* Portrait */}
                            <div className="relative aspect-[3/4] overflow-hidden bg-[#2a2015]">
                                <Image
                                    src={artisan.image}
                                    alt={`${artisan.name} — ${artisan.craft} artisan from ${artisan.location}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1209] via-transparent to-transparent" />
                            </div>

                            {/* Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3
                                    className="text-base font-bold text-white mb-0.5"
                                    style={{ fontFamily: "var(--font-playfair)" }}
                                >
                                    {artisan.name}
                                </h3>
                                <p
                                    className="text-xs text-white/60 mb-1"
                                    style={{ fontFamily: "var(--font-space)" }}
                                >
                                    {artisan.location} · {artisan.craft}
                                </p>
                                <p
                                    className="text-xs text-[#E8A838]/80 mb-2"
                                    style={{ fontFamily: "var(--font-space)" }}
                                >
                                    {artisan.years}
                                </p>

                                {/* Quote — short by default, full on hover */}
                                <p
                                    className="text-xs italic text-white/40 leading-relaxed"
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    <span className="group-hover:hidden">&ldquo;{artisan.quote}&rdquo;</span>
                                    <span className="hidden group-hover:inline">&ldquo;{artisan.fullQuote}&rdquo;</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <a
                        href="#"
                        id="cta-all-artisans"
                        className="inline-flex items-center gap-2 text-[#E8A838] hover:text-[#C4622D] transition-colors text-lg font-medium group"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        All 120 artisans have a story.
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
