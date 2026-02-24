'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ArtisanCard({ artisan, index = 0 }) {
    const name = artisan.user?.name || 'Artisan';
    const avatar = artisan.user?.avatar || '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link
                href={`/artisan/${artisan._id}`}
                className="block p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#1A1209] flex-shrink-0 border-2 border-white/10">
                        {avatar ? (
                            <Image src={avatar} alt={name} fill className="object-cover" sizes="48px" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-lg">👤</div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white/90 truncate group-hover:text-[#C4622D] transition-colors" style={{ fontFamily: 'var(--font-playfair)' }}>
                            {name}
                        </h4>
                        <p className="text-xs text-white/40 truncate">{artisan.craft_specialty}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/40 border border-white/10 text-white/50">{artisan.city}</span>
                    {artisan.rating > 0 && (
                        <span className="text-xs text-yellow-400/80">★ {artisan.rating.toFixed(1)}</span>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
