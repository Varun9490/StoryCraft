'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const statCards = [
    {
        label: 'Orders',
        value: 0,
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
        color: '#C4622D',
    },
    {
        label: 'Wishlist',
        value: 0,
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        ),
        color: '#E55A4A',
    },
    {
        label: 'Chats',
        value: 0,
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        color: '#8B5CF6',
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

export default function BuyerDashboard() {
    const { user } = useAuth();

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
                    Good to see you, {user?.name || 'Explorer'} 👋
                </h1>
                <div className="flex items-center gap-3">
                    <span
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                            fontFamily: 'var(--font-inter)',
                            background: 'rgba(59,130,246,0.15)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            color: '#93c5fd',
                        }}
                    >
                        🛍️ Buyer
                    </span>
                    <span className="text-xs text-white/30" style={{ fontFamily: 'var(--font-inter)' }}>
                        Your craft journey starts here
                    </span>
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

            {/* Discover Crafts Placeholder */}
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
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </motion.div>
                <h3
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Discover Crafts
                </h3>
                <p
                    className="text-sm text-white/30 max-w-md mx-auto"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    Product listings coming in Iteration 2. Browse authentic Vizag crafts
                    and connect directly with artisans.
                </p>
                <a
                    href="/"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                        fontFamily: 'var(--font-inter)',
                        background: '#C4622D',
                        color: '#fff',
                    }}
                >
                    Explore Landing Page →
                </a>
            </motion.div>
        </div>
    );
}
