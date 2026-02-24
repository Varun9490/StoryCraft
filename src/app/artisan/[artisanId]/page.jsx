'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ArtisanProductsGrid from '@/components/artisan/ArtisanProductsGrid';
import VerificationBadge from '@/components/artisan/VerificationBadge';

export default function ArtisanProfilePage({ params }) {
    const { artisanId } = use(params);
    const [artisan, setArtisan] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtisan = async () => {
            try {
                const res = await fetch(`/api/artisans/${artisanId}`);
                const data = await res.json();
                if (data.success) {
                    setArtisan(data.data.artisan);
                    setProducts(data.data.products);
                }
            } catch { }
            setLoading(false);
        };
        fetchArtisan();
    }, [artisanId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#050505] pt-24">
                <Navbar />
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="h-48 bg-white/5 rounded-2xl animate-pulse mb-8" />
                    <div className="h-8 w-1/3 bg-white/5 rounded animate-pulse" />
                </div>
            </main>
        );
    }

    if (!artisan) {
        return (
            <main className="min-h-screen bg-[#050505] pt-24">
                <Navbar />
                <div className="max-w-5xl mx-auto px-6 py-24 text-center">
                    <div className="text-6xl mb-4 opacity-20">👤</div>
                    <h1 className="text-2xl text-white/60" style={{ fontFamily: 'var(--font-playfair)' }}>Artisan Not Found</h1>
                    <Link href="/shop" className="text-sm mt-4 block" style={{ color: '#C4622D' }}>← Back to Shop</Link>
                </div>
            </main>
        );
    }

    const name = artisan.user?.name || 'Artisan';

    return (
        <main className="min-h-screen bg-[#050505] pt-24">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Banner & Avatar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-20"
                >
                    {/* Banner */}
                    <div className="h-48 md:h-60 rounded-2xl overflow-hidden bg-gradient-to-r from-[#1A1209] to-[#050505] border border-white/10">
                        {artisan.banner_image && (
                            <Image src={artisan.banner_image} alt="" fill className="object-cover" sizes="100vw" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                    </div>

                    {/* Avatar */}
                    <div className="absolute -bottom-14 left-8 flex items-end gap-5">
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-[#1A1209] border-4 border-[#050505]">
                            {artisan.profile_image ? (
                                <Image src={artisan.profile_image} alt={name} fill className="object-cover" sizes="112px" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">👤</div>
                            )}
                        </div>
                        <div className="mb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-white/90" style={{ fontFamily: 'var(--font-playfair)' }}>
                                {name}
                            </h1>
                            <p className="text-sm text-white/40">{artisan.craft_specialty}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="md:col-span-2 space-y-4">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/50 border border-white/10">
                                📍 {artisan.city}
                            </span>
                            {artisan.years_of_experience > 0 && (
                                <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/50 border border-white/10">
                                    🕐 {artisan.years_of_experience}+ years
                                </span>
                            )}
                            {artisan.rating > 0 && (
                                <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                    ★ {artisan.rating.toFixed(1)} ({artisan.total_reviews} reviews)
                                </span>
                            )}
                            <VerificationBadge type={artisan.verification_badge} />
                        </div>

                        {/* Bio */}
                        {artisan.bio && (
                            <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">
                                {artisan.bio}
                            </p>
                        )}

                        {/* Social */}
                        {artisan.social_links && (
                            <div className="flex gap-3">
                                {artisan.social_links.instagram && (
                                    <a href={artisan.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-pink-400 transition-colors text-sm">Instagram</a>
                                )}
                                {artisan.social_links.youtube && (
                                    <a href={artisan.social_links.youtube} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-red-400 transition-colors text-sm">YouTube</a>
                                )}
                                {artisan.social_links.facebook && (
                                    <a href={artisan.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-blue-400 transition-colors text-sm">Facebook</a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                            <p className="text-2xl font-bold text-white/80" style={{ fontFamily: 'var(--font-playfair)' }}>
                                {products.length}
                            </p>
                            <p className="text-xs text-white/30">Products</p>
                        </div>
                        {artisan.village && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                <p className="text-sm text-white/60">{artisan.village}</p>
                                <p className="text-xs text-white/30">Village / Origin</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products */}
                <div className="mb-12">
                    <h2
                        className="text-2xl font-bold text-white/80 mb-6"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Crafts by {name}
                    </h2>
                    <ArtisanProductsGrid products={products} />
                </div>
            </div>
        </main>
    );
}
