'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function InfiniteMenu({ items }) {
    const handleDownload = async (e, url, title) => {
        e.stopPropagation();
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `storycraft-${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const handleShare = async (e, title, text, url) => {
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `StoryCraft: ${title}`,
                    text: text,
                    url: url,
                });
            } catch (error) {
                console.error('Error sharing', error);
            }
        } else {
            alert('Web Share API is not supported in your browser.');
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-6 py-8">
            {items.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative w-80 h-[26rem] rounded-xl overflow-hidden group border border-white/10 bg-white/5"
                >
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 320px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                            {item.title}
                        </h3>
                        <p className="text-white/60 text-sm mb-4">{item.description}</p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => handleDownload(e, item.image, item.title)}
                                className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded backdrop-blur-md transition-colors border border-white/10"
                            >
                                ⬇ Download
                            </button>
                            <button
                                onClick={(e) => handleShare(e, item.title, item.description, item.image)}
                                className="flex-1 py-2 bg-[#E07038] hover:bg-[#C4622D] text-white text-sm font-medium rounded transition-colors"
                            >
                                🔗 Share
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
