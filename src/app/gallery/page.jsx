'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import InfiniteMenu from '@/components/reactbits/InfiniteMenu';

export default function GalleryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

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
                            <p className="text-white/30 mb-8">No gallery items yet. Be the first to customize a craft!</p>
                            <a href="/shop" className="px-6 py-3 bg-[#E07038] text-white rounded-xl hover:brightness-110 font-medium">Explore Shop</a>
                        </div>
                    ) : (
                        <InfiniteMenu items={items.map(i => ({
                            image: i.image_url,
                            title: i.product_title,
                            description: `by ${i.artisan_name}`
                        }))} />
                    )}
                </div>
            </main>
        </>
    );
}
