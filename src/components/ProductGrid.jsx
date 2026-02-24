"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const categories = [
    { id: 1, name: "Paintings & Wall Art", icon: "🎨" },
    { id: 2, name: "Wooden Toys & Sculptures", icon: "🪆" },
    { id: 3, name: "Handwoven Textiles", icon: "🧵" },
    { id: 4, name: "Jewellery & Metal Craft", icon: "💍" },
    { id: 5, name: "Pottery & Ceramics", icon: "🏺" },
    { id: 6, name: "Customizable Gifts", icon: "🎁" },
];

const products = [
    {
        id: 1,
        name: '"Bay of Bengal"',
        description: "Hand-painted kalamkari wall panel",
        artisan: "Lakshmi Devi",
        location: "Anakapalle",
        craft: "Kalamkari",
        price: "₹4,500",
        category: "Paintings & Wall Art",
        image: "/images/product-1.jpg",
    },
    {
        id: 2,
        name: '"Araku Morning"',
        description: "Tribal woven throw blanket",
        artisan: "Saraswathi Patnaik",
        location: "Araku",
        craft: "Tribal Weave",
        price: "₹3,200",
        category: "Handwoven Textiles",
        image: "/images/product-2.jpg",
    },
    {
        id: 3,
        name: '"Thousand Hands"',
        description: "Brass Nataraja figurine",
        artisan: "Ananta Rao",
        location: "Vizag",
        craft: "Brass Dhokra",
        price: "₹6,800",
        category: "Jewellery & Metal Craft",
        image: "/images/product-3.jpg",
    },
    {
        id: 4,
        name: '"Story of Rama"',
        description: "Kondapalli wooden set",
        artisan: "Ramu Kondapalli",
        location: "Vijayawada",
        craft: "Wooden Toys",
        price: "₹2,800",
        category: "Wooden Toys & Sculptures",
        image: "/images/product-4.jpg",
    },
    {
        id: 5,
        name: '"Salt & Silk"',
        description: "Natural dye coastal saree",
        artisan: "Lakshmi Devi",
        location: "Anakapalle",
        craft: "Kalamkari",
        price: "₹8,500",
        category: "Handwoven Textiles",
        image: "/images/product-5.jpg",
    },
    {
        id: 6,
        name: '"Palm Whispers"',
        description: "Etched palm leaf manuscript art",
        artisan: "Narasimha",
        location: "Bheemunipatnam",
        craft: "Palm Leaf Art",
        price: "₹1,800",
        category: "Paintings & Wall Art",
        image: "/images/product-6.jpg",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function ProductGrid() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filtered =
        activeCategory === "All"
            ? products
            : products.filter((p) => p.category === activeCategory);

    return (
        <section id="shop" className="section-warm py-24 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
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
                        Curated Collection
                    </span>
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-4"
                        style={{
                            fontFamily: "var(--font-playfair)",
                            color: "#1A1209",
                        }}
                    >
                        Explore the Craft
                    </h2>
                    <p
                        className="text-base text-[#6B5E4E] max-w-xl mx-auto"
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        Each piece is handcrafted with love — browse by category to find
                        something that speaks to you.
                    </p>
                </motion.div>

                {/* Category Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-wrap justify-center gap-3 mb-16"
                >
                    <button
                        id="cat-all"
                        onClick={() => setActiveCategory("All")}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${activeCategory === "All"
                            ? "bg-[#C4622D] text-white border-[#C4622D] shadow-lg shadow-[#C4622D]/20"
                            : "bg-white text-[#6B5E4E] border-[#E5DDD4] hover:border-[#C4622D] hover:text-[#C4622D]"
                            }`}
                        style={{ fontFamily: "var(--font-inter)" }}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            id={`cat-${cat.id}`}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border flex items-center gap-2 ${activeCategory === cat.name
                                ? "bg-[#C4622D] text-white border-[#C4622D] shadow-lg shadow-[#C4622D]/20"
                                : "bg-white text-[#6B5E4E] border-[#E5DDD4] hover:border-[#C4622D] hover:text-[#C4622D]"
                                }`}
                            style={{ fontFamily: "var(--font-inter)" }}
                        >
                            <span>{cat.icon}</span>
                            <span className="hidden sm:inline">{cat.name}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Product Grid */}
                <motion.div
                    key={activeCategory}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filtered.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={cardVariants}
                            className="product-card bg-white rounded-2xl overflow-hidden border border-[#E5DDD4] cursor-pointer group"
                        >
                            {/* Product Image */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-[#F9F6F1]">
                                <Image
                                    src={product.image}
                                    alt={`${product.name} — ${product.description}`}
                                    fill
                                    className="object-cover product-image"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                {/* Fair Price Badge */}
                                <div
                                    className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
                                    style={{
                                        background: "#C4622D",
                                        fontFamily: "var(--font-space)",
                                    }}
                                >
                                    Fair Price
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-5">
                                {/* Artisan Tag */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C4622D] to-[#E8A838] flex items-center justify-center text-white text-xs font-bold">
                                        {product.artisan.charAt(0)}
                                    </div>
                                    <div>
                                        <span
                                            className="text-xs font-medium text-[#1A1209]"
                                            style={{ fontFamily: "var(--font-inter)" }}
                                        >
                                            {product.artisan}
                                        </span>
                                        <span
                                            className="text-xs text-[#6B5E4E] ml-1"
                                            style={{ fontFamily: "var(--font-space)" }}
                                        >
                                            · {product.location}
                                        </span>
                                    </div>
                                </div>

                                {/* Product Name */}
                                <h3
                                    className="text-lg font-bold mb-1 text-[#1A1209]"
                                    style={{ fontFamily: "var(--font-playfair)" }}
                                >
                                    {product.name}
                                </h3>
                                <p
                                    className="text-sm text-[#6B5E4E] mb-3"
                                    style={{ fontFamily: "var(--font-inter)" }}
                                >
                                    {product.description}
                                </p>

                                {/* Category Label */}
                                <span
                                    className="inline-block text-xs px-2 py-1 rounded bg-[#F9F6F1] text-[#6B5E4E] mb-4"
                                    style={{ fontFamily: "var(--font-space)" }}
                                >
                                    {product.craft}
                                </span>

                                {/* Price & CTA */}
                                <div className="flex items-center justify-between pt-3 border-t border-[#E5DDD4]">
                                    <span
                                        className="text-xl font-bold text-[#1A1209]"
                                        style={{ fontFamily: "var(--font-playfair)" }}
                                    >
                                        {product.price}
                                    </span>
                                    <span
                                        className="text-sm font-medium text-[#C4622D] group-hover:underline transition-all"
                                        style={{ fontFamily: "var(--font-inter)" }}
                                    >
                                        View Story →
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
