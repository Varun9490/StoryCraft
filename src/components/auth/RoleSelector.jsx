'use client';

import { motion } from 'framer-motion';

const roles = [
    {
        id: 'buyer',
        title: 'I want to buy',
        subtitle: 'Discover and own authentic crafts from Vizag',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
    },
    {
        id: 'artisan',
        title: 'I create crafts',
        subtitle: 'Sell your traditional work directly to buyers',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
            </svg>
        ),
    },
];

export default function RoleSelector({ selected, onSelect, onNext }) {
    return (
        <div>
            <h2
                className="text-lg font-semibold text-white mb-1 text-center"
                style={{ fontFamily: 'var(--font-playfair)' }}
            >
                How will you use StoryCraft?
            </h2>
            <p className="text-white/40 text-sm mb-6 text-center" style={{ fontFamily: 'var(--font-inter)' }}>
                Choose your role to get started
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {roles.map((role) => (
                    <motion.button
                        key={role.id}
                        type="button"
                        onClick={() => onSelect(role.id)}
                        className="relative p-6 rounded-xl text-left transition-all cursor-pointer border-2"
                        style={{
                            background: selected === role.id ? 'rgba(196,98,45,0.1)' : 'rgba(255,255,255,0.03)',
                            borderColor: selected === role.id ? '#C4622D' : 'rgba(255,255,255,0.08)',
                        }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {selected === role.id && (
                            <motion.div
                                layoutId="roleHighlight"
                                className="absolute inset-0 rounded-xl border-2 border-[#C4622D] pointer-events-none"
                                style={{
                                    boxShadow: '0 0 20px rgba(196,98,45,0.2)',
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        <div className="relative z-10">
                            <div className={`mb-4 ${selected === role.id ? 'text-[#C4622D]' : 'text-white/40'}`}>
                                {role.icon}
                            </div>
                            <h3
                                className="text-base font-semibold text-white mb-1"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            >
                                {role.title}
                            </h3>
                            <p
                                className="text-xs text-white/40"
                                style={{ fontFamily: 'var(--font-inter)' }}
                            >
                                {role.subtitle}
                            </p>
                        </div>

                        {/* Check indicator */}
                        {selected === role.id && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#C4622D] flex items-center justify-center"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </motion.div>
                        )}
                    </motion.button>
                ))}
            </div>

            <button
                type="button"
                onClick={onNext}
                disabled={!selected}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer"
                style={{
                    fontFamily: 'var(--font-inter)',
                    background: selected ? '#C4622D' : 'rgba(255,255,255,0.1)',
                    color: selected ? '#fff' : 'rgba(255,255,255,0.3)',
                    opacity: selected ? 1 : 0.5,
                    cursor: selected ? 'pointer' : 'not-allowed',
                }}
            >
                Continue →
            </button>
        </div>
    );
}
