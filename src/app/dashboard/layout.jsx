'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const { state, dispatch } = useCart();

    const cartItemCount = state?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

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
                                {/* Action Icons Group */}
                                <div className="flex items-center gap-1 sm:gap-2 mr-2">
                                    <Link href="/shop" title="Shop" className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-none">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                    </Link>
                                    {user.role === 'buyer' && (
                                        <Link href="/dashboard/buyer/wishlist" title="Wishlist" className="p-2 rounded-full text-white/50 hover:text-[#E55A4A] hover:bg-[#E55A4A]/10 transition-all cursor-none">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                        </Link>
                                    )}
                                    <Link href="/chat" title="Chat" className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-none">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                    </Link>
                                    <button onClick={() => dispatch({ type: 'SET_DRAWER', payload: true })} title="Cart" className="p-2 rounded-full text-white/50 hover:text-[#C4622D] hover:bg-[#C4622D]/10 transition-all relative cursor-none">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                        {cartItemCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C4622D] text-white text-[10px] flex items-center justify-center font-bold">
                                                {cartItemCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div className="hidden sm:flex items-center gap-3">
                                    {/* Avatar */}
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-white/10" />
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white/10"
                                            style={{
                                                background: user.role === 'artisan'
                                                    ? 'linear-gradient(135deg, #C4622D, #E8A838)'
                                                    : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            }}
                                        >
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
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
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-none"
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
