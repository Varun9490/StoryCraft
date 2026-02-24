'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ArtisanCard from '@/components/artisan/ArtisanCard';

function ArtisansContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentCity = searchParams.get('city') || '';

    useEffect(() => {
        const fetchArtisans = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(searchParams.toString());
                const res = await fetch(`/api/artisans?${params.toString()}`);
                const data = await res.json();
                if (data.success) setArtisans(data.data.artisans);
            } catch { }
            setLoading(false);
        };
        fetchArtisans();
    }, [searchParams]);

    const handleCityFilter = (city) => {
        const params = new URLSearchParams(searchParams.toString());
        if (city) params.set('city', city);
        else params.delete('city');
        router.push(`/artisans?${params.toString()}`, { scroll: false });
    };

    return (
        <main className="min-h-screen bg-[#050505] pt-24">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1
                        className="text-4xl md:text-5xl font-bold text-white/90 mb-2"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        Our Artisans
                    </h1>
                    <p className="text-white/40 text-sm">
                        Meet the hands behind every crafted story
                    </p>
                </motion.div>

                {/* City Filter */}
                <div className="flex gap-2 mb-8">
                    {[
                        { value: '', label: 'All Cities' },
                        { value: 'Visakhapatnam', label: 'Visakhapatnam' },
                        { value: 'Hyderabad', label: 'Hyderabad' },
                    ].map(({ value, label }) => (
                        <button
                            key={label}
                            onClick={() => handleCityFilter(value)}
                            className={`px-4 py-2 rounded-xl text-sm transition-all ${currentCity === value
                                    ? 'bg-[#C4622D] text-white font-semibold'
                                    : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : artisans.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4 opacity-20">👤</div>
                        <p className="text-white/40 text-sm">No artisans found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {artisans.map((artisan, i) => (
                            <ArtisanCard key={artisan._id} artisan={artisan} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default function ArtisansPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <ArtisansContent />
        </Suspense>
    );
}
