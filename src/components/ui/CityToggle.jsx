'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCity } from '@/contexts/CityContext';
import { useState, useRef, useEffect } from 'react';

const cityEmojis = {
    Visakhapatnam: '🌊',
    Hyderabad: '🏰',
    Chennai: '🛕',
    Kolkata: '🎭',
};

export default function CityToggle({ variant = 'dark' }) {
    const { selectedCity, setCity, cities } = useCity();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isDark = variant === 'dark';

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isDark
                        ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                        : 'bg-black/5 border-black/10 text-black/60 hover:bg-black/10 hover:text-black/80'
                    }`}
            >
                <span>{cityEmojis[selectedCity]}</span>
                <span>{selectedCity}</span>
                <span className="text-[10px] opacity-50">▾</span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute top-full mt-1 right-0 rounded-xl border overflow-hidden z-50 min-w-[180px] ${isDark
                                ? 'bg-[#0E0C08] border-white/10'
                                : 'bg-white border-black/10'
                            }`}
                        style={{ backdropFilter: 'blur(16px)' }}
                    >
                        {(cities || []).map((city) => (
                            <button
                                key={city}
                                onClick={() => {
                                    setCity(city);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2 transition-all ${selectedCity === city
                                        ? isDark
                                            ? 'bg-[#E07038]/10 text-[#E07038]'
                                            : 'bg-[#E07038]/10 text-[#E07038]'
                                        : isDark
                                            ? 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                            : 'text-black/50 hover:text-black/80 hover:bg-black/5'
                                    }`}
                            >
                                <span>{cityEmojis[city]}</span>
                                <span>{city}</span>
                                {selectedCity === city && <span className="ml-auto text-[10px]">✓</span>}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
