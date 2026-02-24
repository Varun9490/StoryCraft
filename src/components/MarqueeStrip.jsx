"use client";

import { motion } from "framer-motion";

const marqueeItems = [
    "Kalamkari",
    "Kondapalli Toys",
    "Etikoppaka Lacquer Ware",
    "Brass Dhokra",
    "Nirmal Paintings",
    "Palm Leaf Art",
    "Bidriware",
    "Tribal Weave",
];

export default function MarqueeStrip() {
    const itemList = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems];

    return (
        <section
            id="marquee-transition"
            className="relative w-full overflow-hidden py-5 border-y border-[#C4622D]/15"
            style={{ background: "#050505" }}
        >
            <div className="marquee-track">
                {itemList.map((item, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center whitespace-nowrap px-6 text-sm uppercase tracking-[0.2em]"
                        style={{
                            fontFamily: "var(--font-space)",
                            color: "#C4622D",
                        }}
                    >
                        {item}
                        <span className="ml-6 text-[#E8A838]/50">·</span>
                    </span>
                ))}
            </div>
        </section>
    );
}
