'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/shop/FilterSidebar';
import ShopProductGrid from '@/components/shop/ShopProductGrid';
import EmptyShopState from '@/components/shop/EmptyShopState';

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(searchParams.toString());
                const res = await fetch(`/api/products?${params.toString()}`);
                const data = await res.json();
                if (data.success) {
                    setProducts(data.data.products);
                    setPagination(data.data.pagination);
                }
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchInput.trim()) {
            params.set('search', searchInput.trim());
        } else {
            params.delete('search');
        }
        params.delete('page');
        router.push(`/shop?${params.toString()}`, { scroll: false });
    };

    const handleRemoveFilter = (key) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        params.delete('page');
        router.push(`/shop?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage);
        router.push(`/shop?${params.toString()}`, { scroll: true });
    };

    // Active filter display
    const activeFilters = [];
    if (searchParams.get('city')) activeFilters.push({ key: 'city', label: searchParams.get('city') });
    if (searchParams.get('category')) activeFilters.push({ key: 'category', label: searchParams.get('category').replace('_', ' ') });
    if (searchParams.get('search')) activeFilters.push({ key: 'search', label: `"${searchParams.get('search')}"` });
    if (searchParams.get('minPrice')) activeFilters.push({ key: 'minPrice', label: `Min ₹${searchParams.get('minPrice')}` });
    if (searchParams.get('maxPrice')) activeFilters.push({ key: 'maxPrice', label: `Max ₹${searchParams.get('maxPrice')}` });

    return (
        <main className="min-h-screen bg-[#050505] pt-24">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1
                        className="text-4xl md:text-5xl font-bold text-white/90 mb-2"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        The Craft Shop
                    </h1>
                    <p className="text-white/40 text-sm">
                        Discover handcrafted treasures from our artisan community
                    </p>
                </motion.div>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search crafts, artisans, techniques..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white/80 placeholder:text-white/25 focus:border-[#C4622D] focus:outline-none transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                            style={{ background: '#C4622D' }}
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                            className="lg:hidden px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60"
                        >
                            ⚙️
                        </button>
                    </div>
                </form>

                {/* Active Filters */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {activeFilters.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => handleRemoveFilter(f.key)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 text-white/70 hover:bg-white/20 transition-colors"
                            >
                                {f.label}
                                <span className="text-white/40">×</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-28 p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Mobile Filter Panel */}
                    {mobileFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 z-[9998] bg-black/70 lg:hidden"
                            onClick={() => setMobileFilterOpen(false)}
                        >
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                transition={{ type: 'spring', damping: 25 }}
                                className="absolute inset-y-0 left-0 w-80 bg-[#0a0a0a] p-6 overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FilterSidebar onMobileClose={() => setMobileFilterOpen(false)} />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Products */}
                    <div className="flex-1 min-w-0">
                        {/* Result count */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs text-white/30">
                                {pagination.total || 0} crafts found
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="aspect-[4/5] rounded-2xl bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <EmptyShopState />
                        ) : (
                            <ShopProductGrid products={products} />
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12 mb-8">
                                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`w-10 h-10 rounded-lg text-sm transition-all ${pagination.page === i + 1
                                                ? 'bg-[#C4622D] text-white font-bold'
                                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <ShopContent />
        </Suspense>
    );
}
