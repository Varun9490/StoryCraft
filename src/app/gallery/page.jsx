'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

export default function GalleryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                // Fetch users with approved customizations
                const res = await fetch('/api/gallery');
                const data = await res.json();
                if (data.success) setItems(data.data.items || []);
            } catch {
                // Use mock data as fallback
                setItems([
                    { id: '1', image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800', product_title: 'Customized Kantha Quilt', artisan_name: 'Rina Devi', created_at: new Date() },
                    { id: '2', image_url: 'https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=800', product_title: 'Personalized Dokra Figurine', artisan_name: 'Ramu Baske', created_at: new Date() },
                    { id: '3', image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', product_title: 'Custom Tanjore Painting', artisan_name: 'Lakshmi Iyer', created_at: new Date() },
                    { id: '4', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', product_title: 'Bespoke Pochampally Saree', artisan_name: 'Rama Rao', created_at: new Date() },
                    { id: '5', image_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800', product_title: 'Custom Terracotta Temple Horse', artisan_name: 'Bishnupur Artisans', created_at: new Date() },
                    { id: '6', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', product_title: 'Handmade Bidri Vase', artisan_name: 'Ahmed Khan', created_at: new Date() },
                ]);
            }
            setLoading(false);
        };
        fetchGallery();
    }, []);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#06060A] pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-[#E07038] text-xs uppercase tracking-[0.3em] font-medium">Community</span>
                        <h1
                            className="text-3xl md:text-4xl font-bold text-white/90 mt-2"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            Crafted For You Gallery
                        </h1>
                        <p className="text-sm text-white/40 mt-3 max-w-lg mx-auto">
                            A showcase of approved customizations — stories co-created between artisans and patrons.
                        </p>
                    </div>

                    {loading ? (
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/10 animate-pulse break-inside-avoid" style={{ height: `${200 + Math.random() * 150}px` }} />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4 opacity-30">🎨</div>
                            <p className="text-white/30">No gallery items yet. Be the first to customize a craft!</p>
                        </div>
                    ) : (
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                            {items.map((item, i) => (
                                <motion.div
                                    key={item.id || i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="break-inside-avoid rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden group cursor-pointer hover:border-white/20 transition-all"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <div className="relative aspect-auto overflow-hidden">
                                        <Image
                                            src={item.image_url}
                                            alt={item.product_title}
                                            width={400}
                                            height={item.id ? (300 + (parseInt(item.id, 10) % 3) * 60) : 350}
                                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs font-medium text-white/70 truncate">{item.product_title}</p>
                                        <p className="text-[10px] text-white/30 mt-0.5">by {item.artisan_name}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lightbox */}
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-8"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="max-w-2xl max-h-[80vh] w-full rounded-2xl overflow-hidden bg-[#0E0C08] border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative aspect-video">
                                <Image
                                    src={selectedItem.image_url}
                                    alt={selectedItem.product_title}
                                    fill
                                    className="object-cover"
                                    sizes="640px"
                                />
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-white/90" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {selectedItem.product_title}
                                </h3>
                                <p className="text-sm text-white/40 mt-1">Crafted by {selectedItem.artisan_name}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </>
    );
}
