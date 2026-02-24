'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const statCards = [
    {
        label: 'Products Listed',
        value: 0,
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        ),
        color: '#C4622D',
    },
    {
        label: 'Orders Received',
        value: 0,
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
        ),
        color: '#E8A838',
    },
    {
        label: 'Total Revenue',
        value: '₹0',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
        color: '#52B788',
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

export default function ArtisanDashboard() {
    const { user } = useAuth();

    const artisanProfile = user?.artisanProfile;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-10"
            >
                <h1
                    className="text-3xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Welcome back, {user?.name || 'Artisan'} 🎨
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                    <span
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                            fontFamily: 'var(--font-inter)',
                            background: 'rgba(196,98,45,0.15)',
                            border: '1px solid rgba(196,98,45,0.3)',
                            color: '#E8A838',
                        }}
                    >
                        🎨 Artisan
                    </span>
                    {artisanProfile?.craft_specialty && (
                        <span
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                                fontFamily: 'var(--font-inter)',
                                background: 'rgba(232,168,56,0.1)',
                                border: '1px solid rgba(232,168,56,0.2)',
                                color: '#E8A838',
                            }}
                        >
                            {artisanProfile.craft_specialty}
                        </span>
                    )}
                    {artisanProfile?.is_verified ? (
                        <span
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                                fontFamily: 'var(--font-inter)',
                                background: 'rgba(82,183,136,0.15)',
                                border: '1px solid rgba(82,183,136,0.3)',
                                color: '#52B788',
                            }}
                        >
                            ✓ Verified Artisan
                        </span>
                    ) : (
                        <span
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                                fontFamily: 'var(--font-inter)',
                                background: 'rgba(232,168,56,0.1)',
                                border: '1px solid rgba(232,168,56,0.2)',
                                color: '#E8A838',
                            }}
                        >
                            ⏳ Verification Pending
                        </span>
                    )}
                </div>
            </motion.div>

            {/* Stat Cards */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {statCards.map((card) => (
                    <motion.div
                        key={card.label}
                        variants={cardVariants}
                        className="rounded-2xl p-6 border"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(12px)',
                            borderColor: 'rgba(255,255,255,0.06)',
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    background: `${card.color}15`,
                                    color: card.color,
                                }}
                            >
                                {card.icon}
                            </div>
                            <span
                                className="text-3xl font-bold text-white"
                                style={{ fontFamily: 'var(--font-playfair)' }}
                            >
                                {card.value}
                            </span>
                        </div>
                        <p
                            className="text-sm text-white/40"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            {card.label}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* List Product Placeholder */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="rounded-2xl border-2 border-dashed p-12 text-center"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
                <motion.div
                    animate={{
                        boxShadow: [
                            '0 0 0 0 rgba(196,98,45,0.2)',
                            '0 0 0 12px rgba(196,98,45,0)',
                        ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{ background: 'rgba(196,98,45,0.1)' }}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4622D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </motion.div>
                <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    List Your First Product
                </h3>
                <p
                    className="text-sm text-white/30 max-w-md mx-auto"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    Product listing coming in Iteration 2. Upload photos, set your fair price,
                    and tell the story behind your craft.
                </p>
            </motion.div>
        </div>
    );
}
