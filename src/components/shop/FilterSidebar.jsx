'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function FilterSidebar({ productCounts = {}, onMobileClose }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    const currentCity = searchParams.get('city') || '';
    const currentCategory = searchParams.get('category') || '';
    const currentSort = searchParams.get('sort') || 'newest';

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page');
        router.push(`/shop?${params.toString()}`, { scroll: false });
        if (onMobileClose) onMobileClose();
    };

    const handlePriceFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minPrice) params.set('minPrice', minPrice);
        else params.delete('minPrice');
        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');
        params.delete('page');
        router.push(`/shop?${params.toString()}`, { scroll: false });
    };

    const clearAll = () => {
        router.push('/shop', { scroll: false });
        if (onMobileClose) onMobileClose();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Filters</h3>
                <button onClick={clearAll} className="text-xs text-white/40 hover:text-[#C4622D] transition-colors">
                    Clear All
                </button>
            </div>

            {/* City */}
            <div>
                <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">City</h4>
                <div className="space-y-2">
                    {[
                        { value: '', label: 'All Cities' },
                        { value: 'Visakhapatnam', label: 'Visakhapatnam' },
                        { value: 'Hyderabad', label: 'Hyderabad' },
                    ].map(({ value, label }) => (
                        <label
                            key={label}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <span
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${currentCity === value
                                        ? 'border-[#C4622D] bg-[#C4622D]'
                                        : 'border-white/20 group-hover:border-white/40'
                                    }`}
                            >
                                {currentCity === value && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </span>
                            <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                                {label}
                            </span>
                            <input
                                type="radio"
                                name="city"
                                className="hidden"
                                checked={currentCity === value}
                                onChange={() => updateParam('city', value)}
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/* Category */}
            <div>
                <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Category</h4>
                <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                        <label
                            key={cat.id}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <span
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors text-[10px] ${currentCategory === cat.id
                                        ? 'border-[#C4622D] bg-[#C4622D] text-white'
                                        : 'border-white/20 text-transparent group-hover:border-white/40'
                                    }`}
                            >
                                ✓
                            </span>
                            <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors flex-1">
                                {cat.icon} {cat.label}
                            </span>
                            {productCounts[cat.id] !== undefined && (
                                <span className="text-[10px] text-white/30">{productCounts[cat.id]}</span>
                            )}
                            <input
                                type="radio"
                                name="category"
                                className="hidden"
                                checked={currentCategory === cat.id}
                                onChange={() => updateParam('category', currentCategory === cat.id ? '' : cat.id)}
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Price Range</h4>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        placeholder="₹ Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/30 focus:border-[#C4622D] focus:outline-none transition-colors"
                    />
                    <span className="text-white/30">–</span>
                    <input
                        type="number"
                        placeholder="₹ Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/30 focus:border-[#C4622D] focus:outline-none transition-colors"
                    />
                </div>
                <button
                    onClick={handlePriceFilter}
                    className="mt-2 w-full py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                >
                    Apply Price
                </button>
            </div>

            {/* Sort */}
            <div>
                <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Sort By</h4>
                <select
                    value={currentSort}
                    onChange={(e) => updateParam('sort', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:border-[#C4622D] focus:outline-none transition-colors appearance-none cursor-pointer"
                    style={{ backgroundImage: 'none' }}
                >
                    <option value="newest" className="bg-[#0a0a0a]">Newest</option>
                    <option value="price_asc" className="bg-[#0a0a0a]">Price: Low → High</option>
                    <option value="price_desc" className="bg-[#0a0a0a]">Price: High → Low</option>
                    <option value="views" className="bg-[#0a0a0a]">Most Viewed</option>
                </select>
            </div>
        </div>
    );
}
