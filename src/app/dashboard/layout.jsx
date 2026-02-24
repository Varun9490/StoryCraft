'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[#C4622D] border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/40 text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: '#050505' }}>
            {/* Top Navbar */}
            <nav
                className="sticky top-0 z-50 border-b px-6 py-3"
                style={{
                    background: 'rgba(5,5,5,0.9)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(255,255,255,0.08)',
                }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2">
                        <span
                            className="text-xl font-bold italic"
                            style={{ fontFamily: 'var(--font-playfair)', color: '#C4622D' }}
                        >
                            StoryCraft
                        </span>
                    </a>

                    {/* User Info + Logout */}
                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <div className="hidden sm:flex items-center gap-3">
                                    {/* Avatar */}
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                        style={{
                                            background: user.role === 'artisan'
                                                ? 'linear-gradient(135deg, #C4622D, #E8A838)'
                                                : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                        }}
                                    >
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p
                                            className="text-sm text-white font-medium leading-tight"
                                            style={{ fontFamily: 'var(--font-inter)' }}
                                        >
                                            {user.name}
                                        </p>
                                        <span
                                            className="text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5"
                                            style={{
                                                fontFamily: 'var(--font-inter)',
                                                background: user.role === 'artisan'
                                                    ? 'rgba(196,98,45,0.2)'
                                                    : 'rgba(59,130,246,0.2)',
                                                color: user.role === 'artisan' ? '#E8A838' : '#93c5fd',
                                                border: `1px solid ${user.role === 'artisan'
                                                    ? 'rgba(196,98,45,0.3)'
                                                    : 'rgba(59,130,246,0.3)'
                                                    }`,
                                            }}
                                        >
                                            {user.role === 'artisan' ? '🎨 Artisan' : '🛍️ Buyer'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                                    style={{
                                        fontFamily: 'var(--font-inter)',
                                        color: 'rgba(255,255,255,0.5)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = 'rgba(229,90,74,0.5)';
                                        e.target.style.color = '#E55A4A';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.target.style.color = 'rgba(255,255,255,0.5)';
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Page content */}
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#1a1a1a',
                        color: '#EDE8E0',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontFamily: 'var(--font-inter)',
                        borderRadius: '12px',
                    },
                    success: {
                        iconTheme: { primary: '#52B788', secondary: '#1a1a1a' },
                    },
                    error: {
                        iconTheme: { primary: '#E55A4A', secondary: '#1a1a1a' },
                    },
                }}
            />
        </div>
    );
}
