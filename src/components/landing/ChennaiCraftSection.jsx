'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { chennaiCrafts } from '@/data/chennai-crafts';

export default function ChennaiCraftSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-20 bg-[#0E0C08] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-[#D4A853] text-xs uppercase tracking-[0.3em] font-medium">
                        Chennai · Tamil Nadu
                    </span>
                    <h2
                        className="text-3xl md:text-4xl font-bold text-white/90 mt-2"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Temple Arts & Sacred Geometry
                    </h2>
                    <p className="text-sm text-white/40 mt-2 max-w-xl">
                        From Kanchipuram looms weaving gold into silk to the sacred kolams drawn at dawn — Chennai preserves art forms that are mathematical, devotional, and ancient.
                    </p>
                </motion.div>
            </div>

            <div className="flex gap-6 px-6 overflow-x-auto scrollbar-hide pb-4">
                {chennaiCrafts.map((craft, i) => (
                    <motion.div
                        key={craft.id}
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: i * 0.15, duration: 0.6 }}
                        className="min-w-[300px] md:min-w-[340px] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] flex-shrink-0 group"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                                src={craft.imageUrl}
                                alt={craft.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                sizes="340px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3">
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: craft.accentColor + '20', color: craft.accentColor, border: `1px solid ${craft.accentColor}40` }}
                                >
                                    {craft.artisanCount} artisans
                                </span>
                            </div>
                        </div>
                        <div className="p-5">
                            <h3
                                className="text-lg font-bold text-white/90 mb-1"
                                style={{ fontFamily: 'var(--font-playfair)' }}
                            >
                                {craft.name}
                            </h3>
                            <p className="text-[11px] text-white/30 mb-3">{craft.origin}</p>
                            <p className="text-sm text-white/50 leading-relaxed">{craft.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
